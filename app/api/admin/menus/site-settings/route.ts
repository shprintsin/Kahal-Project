/**
 * GET /api/admin/menus/site-settings
 * 
 * Retrieve global site settings (copyright text, etc.)
 */

import { NextResponse } from "next/server";
import { getSiteSettings } from "@/app/admin/actions/menus";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    
    if (!settings) {
      return NextResponse.json(
        { copyrightText: { default: "", translations: {} } }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in GET /api/admin/menus/site-settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}
