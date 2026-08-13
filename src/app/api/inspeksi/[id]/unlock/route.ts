import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Demo "pembayaran" report lengkap. Belum terhubung ke payment gateway
 * sungguhan (di luar cakupan lingkungan ini) — endpoint ini langsung
 * membuka akses agar alur freemium bisa dicoba end-to-end. Ganti dengan
 * verifikasi callback dari payment gateway sebelum production.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
  }

  await prisma.inspection.update({ where: { id }, data: { isUnlocked: true } });

  return NextResponse.json({ ok: true });
}
