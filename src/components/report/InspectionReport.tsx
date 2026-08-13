import type { ChecklistTemplate, AnswerMap } from "@/lib/types";
import type { VerdictResult } from "@/lib/verdict";
import { VerdictCard } from "@/components/VerdictCard";
import { FindingItem } from "@/components/report/FindingItem";
import { allItemsOf } from "@/lib/template";

export function InspectionReport({
  template,
  answers,
  result,
  vehicleLabel,
  inspectedAtLabel,
  isUnlocked,
  unlockSlot,
}: {
  template: ChecklistTemplate;
  answers: AnswerMap;
  result: VerdictResult;
  vehicleLabel: string;
  inspectedAtLabel: string;
  isUnlocked: boolean;
  unlockSlot?: React.ReactNode;
}) {
  const items = allItemsOf(template);
  const noted = items.filter((item) => {
    const status = answers[item.id]?.status;
    return status === "bermasalah" || status === "perhatian";
  });

  return (
    <div>
      <VerdictCard
        verdict={result.verdict}
        summary={result.summary}
        vehicleLabel={vehicleLabel}
        inspectedAtLabel={inspectedAtLabel}
        stats={{ major: result.stats.majorBermasalah + result.dealBreakers.length, minor: result.stats.minorBermasalah }}
      />

      <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink-soft)]">
        {template.meta.disclaimer}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Laporan lengkap</h2>
          <span className="font-data text-xs text-[var(--ink-soft)]">
            {result.stats.answeredItems}/{result.stats.totalItems} item diperiksa
          </span>
        </div>

        {isUnlocked ? (
          noted.length > 0 ? (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] px-5">
              {noted.map((item) => (
                <FindingItem key={item.id} item={item} answer={answers[item.id] ?? {}} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Belum ada item yang ditandai &quot;perlu perhatian&quot; atau &quot;bermasalah&quot;.
            </p>
          )
        ) : (
          <div className="mt-3">
            <div className="pointer-events-none select-none space-y-3 opacity-40 blur-[2px]" aria-hidden>
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="h-16 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)]" />
              ))}
            </div>
            <div className="-mt-24">{unlockSlot}</div>
          </div>
        )}
      </div>
    </div>
  );
}
