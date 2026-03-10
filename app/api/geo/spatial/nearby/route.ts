import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const lat = parseFloat(params.get("lat") || "")
    const lon = parseFloat(params.get("lon") || "")
    const radiusKm = parseFloat(params.get("radius") || "50")
    const limit = Math.min(parseInt(params.get("limit") || "20"), 100)

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "Required params: lat, lon (decimal degrees)" },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: "Coordinates out of valid range" },
        { status: 400 }
      )
    }

    if (radiusKm <= 0 || radiusKm > 500) {
      return NextResponse.json(
        { error: "Radius must be between 0 and 500 km" },
        { status: 400 }
      )
    }

    const radiusMeters = radiusKm * 1000

    const layers = await prisma.$queryRaw<
      { id: string; slug: string; name: string; type: string; description: string | null; distance_km: number }[]
    >`
      SELECT
        l.id, l.slug, l.name, l.type, l.description,
        ROUND((ST_Distance(l.geom::geography, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography) / 1000)::numeric, 2) AS distance_km
      FROM layers l
      WHERE l.status = 'published'
        AND l.geom IS NOT NULL
        AND ST_DWithin(
          l.geom::geography,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY distance_km
      LIMIT ${limit}
    `

    return NextResponse.json({ layers, count: layers.length })
  } catch (error) {
    console.error("Error in GET /api/geo/spatial/nearby:", error)
    return NextResponse.json({ error: "Spatial query failed" }, { status: 500 })
  }
}
