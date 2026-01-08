import { NextRequest, NextResponse } from "next/server";
import { getVolumePageByPath } from "@/app/admin/actions/collections";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
      seriesSlug: string;
      volumeSlug: string;
      pageIndex: string;
    }>;
  }
) {
  const { slug, seriesSlug, volumeSlug, pageIndex } = await params;
  const index = parseInt(pageIndex);

  if (isNaN(index)) {
    return NextResponse.json({ error: "Invalid page index" }, { status: 400 });
  }

  const page = await getVolumePageByPath(slug, seriesSlug, volumeSlug, index);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}
