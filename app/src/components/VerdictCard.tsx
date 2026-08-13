import type { Vehicle, VerdictResult } from '../types'

const LEVELS = {
  go: {
    stamp: 'LAYAK DIPERTIMBANGKAN',
    color: 'text-clear',
    border: 'border-clear',
    bg: 'bg-clear-soft',
  },
  'hati-hati': {
    stamp: 'PERIKSA LEBIH LANJUT',
    color: 'text-caution',
    border: 'border-caution',
    bg: 'bg-caution-soft',
  },
  'no-go': {
    stamp: 'TIDAK DISARANKAN',
    color: 'text-critical',
    border: 'border-critical',
    bg: 'bg-critical-soft',
  },
} as const

/**
 * Kartu Verdict — signature element (design brief):
 * hasil rekomendasi ditampilkan seperti stempel hasil diagnosa resmi.
 */
export function VerdictCard({
  verdict,
  vehicle,
  date,
}: {
  verdict: VerdictResult
  vehicle: Vehicle
  date: number
}) {
  const lv = LEVELS[verdict.level]
  const complete = verdict.answeredMajor >= verdict.totalMajor

  return (
    <div className="rounded-card border border-line bg-card p-1.5">
      <div className={`rounded-[3px] border ${lv.border} ${lv.bg} px-4 py-5`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          Hasil inspeksi
        </p>
        <p className={`mt-1.5 font-mono text-xl font-semibold leading-tight tracking-tight ${lv.color}`}>
          {lv.stamp}
        </p>
        <p className="mt-1 text-sm font-medium text-ink">{verdict.headline}</p>

        <div className="mt-4 space-y-1 border-t border-ink/10 pt-3">
          <Row label="Kendaraan" value={`${vehicle.brand} ${vehicle.model}`} />
          <Row label="Tahun" value={vehicle.yearRange} />
          {vehicle.detail && <Row label="Catatan" value={vehicle.detail} />}
          <Row
            label="Tanggal"
            value={new Date(date).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          />
          <Row
            label="Pemeriksaan"
            value={`${verdict.answeredTotal}/${verdict.totalItems} item · ${verdict.answeredMajor}/${verdict.totalMajor} penting`}
          />
        </div>

        {!complete && (
          <p className="mt-3 rounded-sm border border-caution/40 bg-card px-2.5 py-2 text-xs leading-relaxed text-ink-soft">
            Belum semua pemeriksaan penting diisi — anggap hasil ini sementara.
          </p>
        )}
      </div>

      <ul className="space-y-2 px-3 py-3.5">
        {verdict.reasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
            <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-faint" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span className="num text-right text-[13px] text-ink">{value}</span>
    </div>
  )
}
