import { verdictHint, verdictLabel } from "@/lib/scoring";
import type { Verdict } from "@/lib/types";

const STYLES: Record<
  Verdict,
  { border: string; bg: string; text: string; ring: string }
> = {
  go: {
    border: "border-clear",
    bg: "bg-clear-soft",
    text: "text-clear",
    ring: "shadow-[inset_0_0_0_1px_rgba(46,125,82,0.25)]",
  },
  "hati-hati": {
    border: "border-caution",
    bg: "bg-caution-soft",
    text: "text-caution",
    ring: "shadow-[inset_0_0_0_1px_rgba(192,132,32,0.25)]",
  },
  "no-go": {
    border: "border-critical",
    bg: "bg-critical-soft",
    text: "text-critical",
    ring: "shadow-[inset_0_0_0_1px_rgba(178,59,50,0.25)]",
  },
};

export function VerdictStamp({
  verdict,
  score,
  compact = false,
}: {
  verdict: Verdict;
  score?: number;
  compact?: boolean;
}) {
  const s = STYLES[verdict];

  return (
    <div className={`animate-stamp ${compact ? "" : "mb-6"}`}>
      <div
        className={`relative overflow-hidden rounded-[6px] border-2 ${s.border} ${s.bg} ${s.ring} px-5 py-5`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full border border-current/10"
        />
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          Hasil inspeksi
        </p>
        <h2
          className={`font-display mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight ${s.text} sm:text-[2rem]`}
        >
          {verdictLabel(verdict)}
        </h2>
        {!compact && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            {verdictHint(verdict)}
          </p>
        )}
        {typeof score === "number" && (
          <p className="font-data mt-4 text-sm text-ink">
            Skor kondisi{" "}
            <span className={`text-lg font-semibold ${s.text}`}>{score}</span>
            <span className="text-ink-muted"> / 100</span>
          </p>
        )}
      </div>
    </div>
  );
}
