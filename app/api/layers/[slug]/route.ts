import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLayerBySlug, updateLayer, deleteLayer } from "@/app/admin/actions/layers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      lang: searchParams.get("lang") || undefined,
      includeMaps: searchParams.get("includeMaps") === "true",
    };

    const layer = await getLayerBySlug(slug, options);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json(layer);
  } catch (error) {
    console.error("Error in GET /api/layers/[slug]:", error);
    return NextResponse.json({ error: "Failed to fetch layer" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    const existingLayer = await getLayerBySlug(slug);
    if (!existingLayer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    const layer = await updateLayer(existingLayer.id, body);
    return NextResponse.json(layer);
  } catch (error) {
    console.error("Error in PUT /api/layers/[slug]:", error);
    return NextResponse.json({ error: "Failed to update layer" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const existingLayer = await getLayerBySlug(slug);
    if (!existingLayer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    await deleteLayer(existingLayer.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete layer";
    console.error("Error in DELETE /api/layers/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to delete layer" },
      { status: message.includes("used in") ? 409 : 500 }
    );
  }
}
