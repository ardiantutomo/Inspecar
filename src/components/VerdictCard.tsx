import { cn } from "@/lib/cn";
import type { Verdict } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/verdict";

const VERDICT_STYLE: Record<Verdict, { border: string; text: string; stamp: string; bg: string }> = {
  go: {
    border: "border-[var(--clear)]",
    text: "text-[var(--clear)]",
    stamp: "LAYAK",
    bg: "bg-[var(--clear-soft)]",
  },
  "hati-hati": {
    border: "border-[var(--caution)]",
    text: "text-[var(--caution)]",
    stamp: "HATI-HATI",
    bg: "bg-[var(--caution-soft)]",
  },
  "no-go": {
    border: "border-[var(--critical)]",
    text: "text-[var(--critical)]",
    stamp: "JANGAN LANJUT",
    bg: "bg-[var(--critical-soft)]",
  },
};

interface VerdictCardProps {
  verdict: Verdict;
  summary: string;
  vehicleLabel: string;
  inspectedAtLabel: string;
  stats: { major: number; minor: number };
}

export function VerdictCard({ verdict, summary, vehicleLabel, inspectedAtLabel, stats }: VerdictCardProps) {
  const style = VERDICT_STYLE[verdict];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-md)] border-2 bg-[var(--surface-raised)] p-6 sm:p-8",
        style.border
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 flex h-28 w-28 rotate-[12deg] items-center justify-center rounded-full border-4 text-center font-display text-[11px] font-bold leading-tight tracking-wide sm:h-32 sm:w-32 sm:text-xs",
          style.border,
          style.text
        )}
      >
        {style.stamp}
      </div>

      <p className="font-data text-xs uppercase tracking-wide text-[var(--ink-soft)]">Hasil inspeksi · {inspectedAtLabel}</p>
      <h2 className="mt-1 max-w-[80%] font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{vehicleLabel}</h2>

      <div className={cn("mt-4 inline-flex items-center rounded-[var(--radius-sm)] px-3 py-1.5", style.bg)}>
        <span className={cn("font-display text-lg font-bold sm:text-xl", style.text)}>{VERDICT_LABEL[verdict]}</span>
      </div>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--ink)]">{summary}</p>

      <dl className="mt-6 flex gap-6 border-t border-[var(--line)] pt-4">
        <div>
          <dt className="text-xs text-[var(--ink-soft)]">Temuan mayor</dt>
          <dd className="font-data text-xl font-semibold text-[var(--ink)]">{stats.major}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--ink-soft)]">Temuan minor</dt>
          <dd className="font-data text-xl font-semibold text-[var(--ink)]">{stats.minor}</dd>
        </div>
      </dl>
    </div>
  );
}
