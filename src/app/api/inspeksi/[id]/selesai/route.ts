import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseTemplateSnapshot } from "@/lib/template";
import { computeVerdict } from "@/lib/verdict";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) {
    return NextResponse.json({ error: "Inspeksi tidak ditemukan." }, { status: 404 });
  }

  const template = parseTemplateSnapshot(inspection.templateSnapshot);
  const answers = JSON.parse(inspection.answers);
  const result = computeVerdict(template, answers);

  await prisma.inspection.update({
    where: { id },
    data: {
      status: "selesai",
      verdict: result.verdict,
      verdictSummary: result.summary,
    },
  });

  return NextResponse.json({ ok: true, verdict: result.verdict });
}
