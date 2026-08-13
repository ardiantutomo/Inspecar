import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { deleteInspection, listInspections } from '../lib/storage'
import { buildTemplate } from '../lib/template'
import { computeVerdict } from '../lib/verdict'
import type { Inspection } from '../types'

export function Home() {
  const [inspections, setInspections] = useState(listInspections())

  return (
    <div className="mx-auto max-w-xl px-4 pb-12">
      <header className="flex items-baseline justify-between pb-6 pt-6">
        <p className="text-[17px] font-semibold tracking-tight">
          Periksa<span className="text-brand">Mobil</span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Lembar inspeksi
        </p>
      </header>

      <section className="rounded-card border border-line bg-card px-4 py-5">
        <h1 className="text-[22px] font-semibold leading-snug tracking-tight">
          Mau beli mobil bekas?
          <br />
          Periksa dulu sebelum bayar.
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
          Checklist terpandu untuk pembeli awam: bekas banjir, bekas tabrak, dokumen,
          odometer, mesin, dan test drive — lalu dapatkan rekomendasi yang jelas beserta
          bahan negosiasi harga.
        </p>
        <Link
          to="/pilih-mobil"
          className="mt-4 flex min-h-12 items-center justify-center rounded-sm bg-brand px-4 text-[15px] font-semibold text-white active:bg-brand-deep"
        >
          Mulai inspeksi
        </Link>
        <div className="mt-4 grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft pt-3.5">
          <Stat value="26+" label="titik pemeriksaan" />
          <Stat value="4" label="area rawan tipu" />
          <Stat value="0" label="perlu keahlian montir" />
        </div>
      </section>

      {inspections.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Inspeksi tersimpan
          </h2>
          <ul className="space-y-2">
            {inspections.map((insp) => (
              <InspectionRow
                key={insp.id}
                inspection={insp}
                onDelete={() => {
                  deleteInspection(insp.id)
                  setInspections(listInspections())
                }}
              />
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs leading-relaxed text-ink-faint">
        Hasil checklist ini adalah alat bantu keputusan, bukan jaminan kondisi kendaraan.
        Untuk keputusan akhir, pertimbangkan pemeriksaan oleh bengkel terpercaya. Data
        inspeksi tersimpan di perangkat ini.
      </p>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 first:pl-0">
      <p className="num text-lg font-semibold text-ink">{value}</p>
      <p className="text-[11px] leading-tight text-ink-faint">{label}</p>
    </div>
  )
}

function InspectionRow({
  inspection,
  onDelete,
}: {
  inspection: Inspection
  onDelete: () => void
}) {
  const navigate = useNavigate()
  const { template } = buildTemplate(inspection.vehicle)
  const verdict = computeVerdict(template, inspection.answers)
  const done = verdict.answeredTotal

  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-card p-3.5">
      <button
        type="button"
        onClick={() => navigate(`/inspeksi/${inspection.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-[15px] font-semibold">
          {inspection.vehicle.brand} {inspection.vehicle.model}
        </p>
        <p className="num mt-0.5 text-xs text-ink-faint">
          {inspection.vehicle.yearRange} ·{' '}
          {new Date(inspection.updatedAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
          })}{' '}
          · {done}/{verdict.totalItems} item
        </p>
      </button>
      {done > 0 && (
        <Link
          to={`/hasil/${inspection.id}`}
          className="shrink-0 rounded-sm border border-line px-2.5 py-1.5 text-xs font-medium text-brand"
        >
          Lihat hasil
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          if (confirm('Hapus inspeksi ini? Data & foto akan hilang.')) onDelete()
        }}
        aria-label="Hapus inspeksi"
        className="shrink-0 rounded-sm px-1.5 py-1.5 text-xs text-ink-faint"
      >
        Hapus
      </button>
    </li>
  )
}
