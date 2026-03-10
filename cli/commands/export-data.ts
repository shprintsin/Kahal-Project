import fs from "fs";
import path from "path";
import { getPrisma } from "../db";

export async function exportData(type: string, outputPath?: string, format?: string) {
  const prisma = getPrisma();
  const fmt = format || "json";

  let data: Record<string, unknown>[];

  if (type === "layers") {
    const layers = await prisma.layer.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
        type: true,
        status: true,
        maturity: true,
        minYear: true,
        maxYear: true,
        sources: true,
        license: true,
        sourceUrl: true,
        downloadUrl: true,
      },
    });
    data = layers;
  } else if (type === "places") {
    const places = await prisma.place.findMany({
      include: { administrativePlaces: true },
    });
    data = places.map((p) => ({
      geocode: p.geocode,
      geoname: p.geoname,
      lat: p.lat,
      lon: p.lon,
      countryCode: p.countryCode,
      admin1: p.admin1,
      admin2: p.admin2,
      settlements: p.administrativePlaces.map((ap) => ({
        name: ap.name,
        year: ap.year,
        jewishPop: ap.jewishPop,
        totalPop: ap.totalPop,
      })),
    }));
  } else if (type === "regions") {
    const regions = await prisma.region.findMany();
    data = regions.map((r) => ({
      slug: r.slug,
      name: r.name,
      nameI18n: r.nameI18n,
    }));
  } else if (type === "categories") {
    const categories = await prisma.category.findMany();
    data = categories.map((c) => ({
      slug: c.slug,
      title: c.title,
      titleI18n: c.titleI18n,
    }));
  } else {
    console.error(`Unknown type: ${type}. Use "layers", "places", "regions", or "categories".`);
    process.exit(1);
  }

  const out = outputPath || `${type}.${fmt}`;
  const absoluteOut = path.resolve(out);

  if (fmt === "json") {
    fs.writeFileSync(absoluteOut, JSON.stringify(data, null, 2));
  } else if (fmt === "csv") {
    if (data.length === 0) {
      fs.writeFileSync(absoluteOut, "");
    } else {
      const flatData = data.map(flattenObject);
      const headers = [...new Set(flatData.flatMap(Object.keys))];
      const csvLines = [
        headers.join(","),
        ...flatData.map((row) =>
          headers.map((h) => escapeCsvValue(String(row[h] ?? ""))).join(",")
        ),
      ];
      fs.writeFileSync(absoluteOut, csvLines.join("\n"));
    }
  }

  console.log(`Exported ${data.length} ${type} to ${absoluteOut} (${fmt})`);
  await prisma.$disconnect();
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
