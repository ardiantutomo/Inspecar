import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { parseTemplateSnapshot } from "@/lib/template";
import { computeVerdict } from "@/lib/verdict";
import { InspectionReport } from "@/components/report/InspectionReport";
import type { AnswerMap } from "@/lib/types";

export default async function LaporanPublikPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { shareToken: token } });
  if (!inspection) notFound();

  const template = parseTemplateSnapshot(inspection.templateSnapshot);
  const answers = JSON.parse(inspection.answers) as AnswerMap;
  const result = computeVerdict(template, answers);

  const inspectedAtLabel = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(inspection.createdAt);

  return (
    <Container className="py-8 sm:py-10">
      <p className="mb-4 text-xs text-[var(--ink-soft)]">
        Laporan inspeksi yang dibagikan · dibuat dengan Periksa Dulu
      </p>
      <InspectionReport
        template={template}
        answers={answers}
        result={result}
        vehicleLabel={`${inspection.brand} ${inspection.model} · ${inspection.yearRange}`}
        inspectedAtLabel={inspectedAtLabel}
        isUnlocked={inspection.isUnlocked}
        unlockSlot={
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--ink-soft)]">
            Laporan lengkap belum dibuka oleh pembuatnya.
          </div>
        }
      />
    </Container>
  );
}
