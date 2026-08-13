import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseTemplateSnapshot } from "@/lib/template";
import { computeVerdict } from "@/lib/verdict";
import { InspectionReport } from "@/components/report/InspectionReport";
import { UnlockCard } from "@/components/report/UnlockCard";
import { ShareButton } from "@/components/report/ShareButton";
import type { AnswerMap } from "@/lib/types";

export default async function HasilInspeksiPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection || inspection.userId !== user.id) notFound();

  const template = parseTemplateSnapshot(inspection.templateSnapshot);
  const answers = JSON.parse(inspection.answers) as AnswerMap;
  const result = computeVerdict(template, answers);

  const inspectedAtLabel = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(inspection.createdAt);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex items-center justify-between">
        <Link href={`/inspeksi/${inspection.id}`} className="text-sm text-[var(--ink-soft)] hover:text-[var(--brand-ink)]">
          ← Edit jawaban
        </Link>
        <ShareButton inspectionId={inspection.id} existingToken={inspection.shareToken} />
      </div>

      <div className="mt-6">
        <InspectionReport
          template={template}
          answers={answers}
          result={result}
          vehicleLabel={`${inspection.brand} ${inspection.model} · ${inspection.yearRange}`}
          inspectedAtLabel={inspectedAtLabel}
          isUnlocked={inspection.isUnlocked}
          unlockSlot={<UnlockCard inspectionId={inspection.id} />}
        />
      </div>
    </Container>
  );
}
