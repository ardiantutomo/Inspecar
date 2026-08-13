import { cn } from "@/lib/cn";
import type { Severity } from "@/lib/types";

const SEVERITY_STYLE: Record<Severity, string> = {
  major: "bg-[var(--critical-soft)] text-[var(--critical)]",
  minor: "bg-[var(--caution-soft)] text-[var(--caution)]",
  addon: "bg-[var(--line)] text-[var(--ink-soft)]",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  major: "Mayor",
  minor: "Minor",
  addon: "Tambahan",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        SEVERITY_STYLE[severity],
        className
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-[var(--line-strong)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]",
        className
      )}
      title="Belum diverifikasi menyeluruh — dibangun dari feedback pengguna seiring waktu"
    >
      Beta · belum terverifikasi
    </span>
  );
}
