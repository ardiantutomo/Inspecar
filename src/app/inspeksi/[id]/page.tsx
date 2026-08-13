import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTemplateSnapshot } from "@/lib/template";
import { ChecklistForm } from "@/components/checklist/ChecklistForm";
import type { AnswerMap } from "@/lib/types";

export default async function InspeksiPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) notFound();

  const template = parseTemplateSnapshot(inspection.templateSnapshot);
  const answers = JSON.parse(inspection.answers) as AnswerMap;

  return (
    <Container className="py-8 sm:py-10">
      <p className="font-data text-xs uppercase tracking-wide text-[var(--brand-ink)]">
        {inspection.brand} {inspection.model} · {inspection.yearRange}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">{template.meta.judul}</h1>
      <p className="mt-1 max-w-xl text-sm text-[var(--ink-soft)]">{template.meta.deskripsi}</p>
      <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink-soft)]">
        {template.meta.disclaimer}
      </div>

      <div className="mt-8">
        <ChecklistForm inspectionId={inspection.id} template={template} initialAnswers={answers} />
      </div>
    </Container>
  );
}
