import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PhotoError, savePhoto } from "@/lib/photos";

/**
 * Unggah foto dipisah dari Server Action karena batas ukuran body action jauh di
 * bawah ukuran foto kamera HP.
 */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/inspeksi/[id]/foto">,
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Perlu masuk dulu" }, { status: 401 });
  }

  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan" }, { status: 404 });
  }
  if (inspection.status === "selesai") {
    return NextResponse.json(
      { error: "Inspeksi sudah ditutup, buka kembali dulu untuk mengubah." },
      { status: 409 },
    );
  }

  const formData = await request.formData();
  const itemId = String(formData.get("itemId") ?? "");
  const file = formData.get("file");

  if (!itemId || !(file instanceof File)) {
    return NextResponse.json({ error: "Foto tidak terkirim" }, { status: 400 });
  }

  try {
    const saved = await savePhoto(inspection.id, itemId, file);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof PhotoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Foto gagal diproses. Coba ambil ulang." },
      { status: 500 },
    );
  }
}
