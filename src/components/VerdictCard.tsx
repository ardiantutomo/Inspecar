import { Verdict } from "@/types/checklist";
import { getVerdictStyles } from "@/lib/verdict";

interface VerdictCardProps {
  verdict: Verdict;
  title: string;
  summary: string;
  vehicleLabel?: string;
}

export function VerdictCard({ verdict, title, summary, vehicleLabel }: VerdictCardProps) {
  const styles = getVerdictStyles(verdict);

  return (
    <div
      className={`card overflow-hidden border-2 ${styles.border} ${styles.bg}`}
      role="status"
      aria-label={`Hasil: ${styles.badge}`}
    >
      <div className="border-b border-line/60 px-4 py-2">
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink/50">
          Hasil diagnosa
        </p>
      </div>
      <div className="px-4 py-5">
        <p className={`font-mono text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
          {styles.badge}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
        {vehicleLabel && (
          <p className="mt-1 font-mono text-sm text-ink/60">{vehicleLabel}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{summary}</p>
      </div>
    </div>
  );
}
