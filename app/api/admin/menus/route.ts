/**
 * GET /api/admin/menus
 * 
 * Retrieve all site menu settings
 */

import { NextResponse } from "next/server";
import { getAllSiteSettings } from "@/app/admin/actions/menus";

export async function GET() {
  try {
    const settings = await getAllSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in GET /api/admin/menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu settings" },
      { status: 500 }
    );
  }
}
