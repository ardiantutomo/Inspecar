import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readPhotoBytes } from "@/lib/photos";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/foto/[id]">,
) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { inspection: true },
  });
  if (!photo) return new NextResponse("Tidak ditemukan", { status: 404 });

  const token = new URL(request.url).searchParams.get("t");
  const lewatShareLink =
    Boolean(photo.inspection.shareToken) &&
    token === photo.inspection.shareToken &&
    photo.inspection.paidAt !== null;

  if (!lewatShareLink) {
    const user = await getCurrentUser();
    if (!user || user.id !== photo.inspection.userId) {
      return new NextResponse("Tidak punya akses", { status: 403 });
    }
  }

  try {
    const bytes = await readPhotoBytes(photo.storageKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "content-type": photo.mimeType,
        "content-length": String(bytes.byteLength),
        "cache-control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Berkas foto hilang", { status: 410 });
  }
}
