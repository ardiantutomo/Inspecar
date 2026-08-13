import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getInspection } from '../lib/storage'
import { buildTemplate } from '../lib/template'
import { computeVerdict } from '../lib/verdict'
import { buildShareUrl, type SharePayload } from '../lib/share'
import { VerdictCard } from '../components/VerdictCard'
import { TopBar } from '../components/TopBar'
import { NotFound } from './Inspeksi'
import { FindingList } from '../components/FindingList'

export function Hasil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inspection = useMemo(() => (id ? getInspection(id) : undefined), [id])
  const [copied, setCopied] = useState(false)

  if (!inspection) {
    return (
      <NotFound
        text="Hasil tidak ditemukan di perangkat ini."
        action={() => navigate('/')}
      />
    )
  }

  const { template } = buildTemplate(inspection.vehicle)
  const verdict = computeVerdict(template, inspection.answers)

  const payload: SharePayload = {
    v: 1,
    vehicle: inspection.vehicle,
    createdAt: inspection.createdAt,
    tierBId: inspection.tierBId,
    a: Object.fromEntries(
      Object.entries(inspection.answers)
        .filter(([, ans]) => ans.kondisi)
        .map(([itemId, ans]) => [
          itemId,
          [ans.kondisi, ans.catatan || undefined] as [typeof ans.kondisi, string?],
        ]),
    ),
  }

  async function share() {
    const url = buildShareUrl(payload)
    const title = `Hasil inspeksi ${inspection!.vehicle.brand} ${inspection!.vehicle.model}`
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // dibatalkan user — lanjut ke salin
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-dvh">
      <TopBar title="Hasil inspeksi" backTo={`/inspeksi/${inspection.id}`} />
      <div className="mx-auto max-w-xl px-4 pb-16 pt-4">
        <VerdictCard
          verdict={verdict}
          vehicle={inspection.vehicle}
          date={inspection.updatedAt}
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={share}
            className="flex min-h-11 items-center justify-center rounded-sm bg-brand px-3 text-sm font-semibold text-white active:bg-brand-deep"
          >
            {copied ? 'Link tersalin' : 'Bagikan laporan'}
          </button>
          <Link
            to={`/inspeksi/${inspection.id}`}
            className="flex min-h-11 items-center justify-center rounded-sm border border-line bg-card px-3 text-sm font-medium text-ink"
          >
            Ubah isian
          </Link>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
          Link laporan memuat hasil & catatan (tanpa foto) — bisa dibuka siapa pun tanpa
          aplikasi, misalnya untuk ditunjukkan ke keluarga atau dipakai nego.
        </p>

        <FindingList template={template} answers={inspection.answers} verdict={verdict} />

        {template.meta?.disclaimer && (
          <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            {template.meta.disclaimer}
          </p>
        )}

        <Link
          to="/pilih-mobil"
          className="mt-4 block text-center font-mono text-xs uppercase tracking-wider text-brand"
        >
          Inspeksi mobil lain ›
        </Link>
      </div>
    </div>
  )
}
