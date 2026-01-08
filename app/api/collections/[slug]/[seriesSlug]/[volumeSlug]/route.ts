import { NextRequest, NextResponse } from "next/server";
import { getVolumeWithPagesByPath } from "@/app/admin/actions/collections";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; seriesSlug: string; volumeSlug: string }> }
) {
  const { slug, seriesSlug, volumeSlug } = await params;

  const volume = await getVolumeWithPagesByPath(slug, seriesSlug, volumeSlug);

  if (!volume) {
    return NextResponse.json({ error: "Volume not found" }, { status: 404 });
  }

  return NextResponse.json(volume);
}
