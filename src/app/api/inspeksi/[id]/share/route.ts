import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
  }

  const shareToken = inspection.shareToken ?? nanoid(12);
  if (!inspection.shareToken) {
    await prisma.inspection.update({ where: { id }, data: { shareToken } });
  }

  return NextResponse.json({ shareToken });
}
