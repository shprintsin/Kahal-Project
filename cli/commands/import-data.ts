import fs from "fs";
import path from "path";
import { getPrisma } from "../db";

export async function importData(filePath: string, type: string, dryRun?: boolean) {
  const prisma = getPrisma();
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let records: Record<string, unknown>[];

  if (ext === ".json" || ext === ".geojson") {
    records = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
    if (!Array.isArray(records)) {
      records = [records];
    }
  } else if (ext === ".csv") {
    records = parseCsv(fs.readFileSync(absolutePath, "utf-8"));
  } else {
    console.error(`Unsupported format: ${ext}. Use .json, .geojson, or .csv`);
    process.exit(1);
  }

  console.log(`Found ${records.length} records to import as "${type}"`);

  if (dryRun) {
    console.log("Dry run - no changes made. First 3 records:");
    console.log(JSON.stringify(records.slice(0, 3), null, 2));
    await prisma.$disconnect();
    return;
  }

  let imported = 0;

  if (type === "layers") {
    for (const record of records) {
      const slug = (record.slug as string) || `layer-${Date.now()}-${imported}`;
      await prisma.layer.upsert({
        where: { slug },
        update: {
          name: record.name as string,
          description: record.description as string,
          geoJsonData: record.geoJsonData ?? record.geojson ?? null,
          type: (record.type as any) || "POINTS",
          status: (record.status as any) || "draft",
        },
        create: {
          slug,
          name: (record.name as string) || slug,
          description: (record.description as string) || "",
          geoJsonData: record.geoJsonData ?? record.geojson ?? null,
          type: (record.type as any) || "POINTS",
          status: (record.status as any) || "draft",
        },
      });
      imported++;
    }
  } else if (type === "places") {
    for (const record of records) {
      const geocode = (record.geocode as string) || `place-${imported}`;
      await prisma.place.upsert({
        where: { geocode },
        update: {
          geoname: (record.geoname as string) || geocode,
          lat: record.lat ? Number(record.lat) : null,
          lon: record.lon ? Number(record.lon) : null,
          countryCode: (record.countryCode as string) || "PL",
          admin1: record.admin1 as string,
          admin2: record.admin2 as string,
        },
        create: {
          geocode,
          geoname: (record.geoname as string) || geocode,
          lat: record.lat ? Number(record.lat) : null,
          lon: record.lon ? Number(record.lon) : null,
          countryCode: (record.countryCode as string) || "PL",
          admin1: record.admin1 as string,
          admin2: record.admin2 as string,
        },
      });
      imported++;
    }
  } else if (type === "regions") {
    for (const record of records) {
      const slug = (record.slug as string) || `region-${imported}`;
      await prisma.region.upsert({
        where: { slug },
        update: {
          name: (record.name as string) || slug,
          nameI18n: (record.nameI18n as any) || {},
        },
        create: {
          slug,
          name: (record.name as string) || slug,
          nameI18n: (record.nameI18n as any) || {},
        },
      });
      imported++;
    }
  } else {
    console.error(`Unknown type: ${type}. Use "layers", "places", or "regions".`);
    process.exit(1);
  }

  console.log(`Imported ${imported} ${type}`);
  await prisma.$disconnect();
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] || "";
    });
    return record;
  });
}
