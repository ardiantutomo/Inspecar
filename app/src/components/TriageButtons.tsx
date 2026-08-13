import type { Kondisi } from '../types'

const OPTIONS: { value: Kondisi; label: string; active: string; dot: string }[] = [
  {
    value: 'aman',
    label: 'Aman',
    active: 'border-clear bg-clear-soft text-clear',
    dot: 'bg-clear',
  },
  {
    value: 'ragu',
    label: 'Ragu',
    active: 'border-caution bg-caution-soft text-caution',
    dot: 'bg-caution',
  },
  {
    value: 'masalah',
    label: 'Bermasalah',
    active: 'border-critical bg-critical-soft text-critical',
    dot: 'bg-critical',
  },
]

export function TriageButtons({
  value,
  onChange,
}: {
  value?: Kondisi
  onChange: (k: Kondisi | undefined) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Hasil pemeriksaan">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? undefined : opt.value)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-sm border px-2 py-2 text-sm font-medium transition-colors ${
              selected
                ? opt.active
                : 'border-line bg-card text-ink-soft active:bg-surface'
            }`}
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${selected ? opt.dot : 'bg-line'}`}
            />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
