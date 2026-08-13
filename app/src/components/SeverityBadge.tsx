import type { Severity } from '../types'

const STYLES: Record<string, { label: string; cls: string }> = {
  major: { label: 'Penting', cls: 'text-critical border-critical/40 bg-critical-soft' },
  minor: { label: 'Ringan', cls: 'text-caution border-caution/40 bg-caution-soft' },
  addon: { label: 'Khas model', cls: 'text-brand border-brand/40 bg-brand-soft' },
  optional: { label: 'Opsional', cls: 'text-ink-soft border-line bg-surface' },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = STYLES[severity] ?? STYLES.optional
  return (
    <span
      className={`inline-block shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

export function BetaBadge() {
  return (
    <span className="inline-block shrink-0 rounded-sm border border-caution/40 bg-caution-soft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-caution">
      Beta — belum terverifikasi
    </span>
  )
}
