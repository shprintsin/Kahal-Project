import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const west = parseFloat(params.get("west") || "")
    const south = parseFloat(params.get("south") || "")
    const east = parseFloat(params.get("east") || "")
    const north = parseFloat(params.get("north") || "")

    if ([west, south, east, north].some(isNaN)) {
      return NextResponse.json(
        { error: "Required params: west, south, east, north (decimal degrees)" },
        { status: 400 }
      )
    }

    if (west < -180 || east > 180 || south < -90 || north > 90) {
      return NextResponse.json(
        { error: "Coordinates out of valid range" },
        { status: 400 }
      )
    }

    const layers = await prisma.$queryRaw<
      { id: string; slug: string; name: string; type: string; description: string | null }[]
    >`
      SELECT l.id, l.slug, l.name, l.type, l.description
      FROM layers l
      WHERE l.status = 'published'
        AND l.geom IS NOT NULL
        AND ST_Intersects(
          l.geom,
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
        )
      ORDER BY l.name
    `

    return NextResponse.json({ layers, count: layers.length })
  } catch (error) {
    console.error("Error in GET /api/geo/spatial/within:", error)
    return NextResponse.json({ error: "Spatial query failed" }, { status: 500 })
  }
}
