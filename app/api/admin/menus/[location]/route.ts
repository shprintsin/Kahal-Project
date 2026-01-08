/**
 * GET /api/admin/menus/[location]
 * 
 * Retrieve menu items for a specific location
 */

import { NextRequest, NextResponse } from "next/server";
import { getMenuByLocation } from "@/app/admin/actions/menus";
import type { MenuLocation } from "@/app/admin/types/menus";

const VALID_LOCATIONS: MenuLocation[] = [
  "HEADER",
  "HERO_GRID",
  "HERO_ACTIONS",
  "HERO_STRIP",
  "FOOTER",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location: locationParam } = await params;
    const location = locationParam.toUpperCase();

    if (!VALID_LOCATIONS.includes(location as MenuLocation)) {
      return NextResponse.json(
        { error: `Invalid location. Must be one of: ${VALID_LOCATIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const menu = await getMenuByLocation(location as MenuLocation);

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error(`Error in GET /api/admin/menus/[location]:`, error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
