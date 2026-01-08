/**
 * GET /api/admin/menus/footer-columns
 * 
 * Retrieve all footer columns
 */

import { NextResponse } from "next/server";
import { getFooterColumns } from "@/app/admin/actions/menus";

export async function GET() {
  try {
    const columns = await getFooterColumns();
    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error in GET /api/admin/menus/footer-columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer columns" },
      { status: 500 }
    );
  }
}
