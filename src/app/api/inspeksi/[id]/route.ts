import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const answerSchema = z.object({
  status: z.enum(["aman", "perhatian", "bermasalah"]).optional(),
  note: z.string().max(2000).optional(),
  photoUrl: z.string().max(500).optional(),
});

const schema = z.object({
  answers: z.record(z.string(), answerSchema),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data jawaban tidak valid." }, { status: 400 });
  }

  await prisma.inspection.update({
    where: { id },
    data: { answers: JSON.stringify(parsed.data.answers) },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    id: inspection.id,
    answers: JSON.parse(inspection.answers),
    status: inspection.status,
  });
}
