import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { decodeShare } from '../lib/share'
import { buildTemplate } from '../lib/template'
import { computeVerdict } from '../lib/verdict'
import { VerdictCard } from '../components/VerdictCard'
import { FindingList } from '../components/FindingList'
import { NotFound } from './Inspeksi'
import type { Answer } from '../types'

/** Tampilan laporan yang dibagikan lewat link — read-only, tanpa foto. */
export function Laporan() {
  const { data } = useParams()
  const navigate = useNavigate()
  const payload = useMemo(() => (data ? decodeShare(data) : null), [data])

  if (!payload) {
    return (
      <NotFound
        text="Link laporan tidak valid atau terpotong. Minta pengirim membagikan ulang."
        action={() => navigate('/')}
      />
    )
  }

  const { template } = buildTemplate(payload.vehicle)
  const answers: Record<string, Answer> = Object.fromEntries(
    Object.entries(payload.a).map(([itemId, [kondisi, catatan]]) => [
      itemId,
      { kondisi, catatan },
    ]),
  )
  const verdict = computeVerdict(template, answers)

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-12 max-w-xl items-center justify-between px-4">
          <p className="text-[15px] font-semibold tracking-tight">
            Periksa<span className="text-brand">Mobil</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Laporan dibagikan
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-16 pt-4">
        <VerdictCard verdict={verdict} vehicle={payload.vehicle} date={payload.createdAt} />

        <FindingList
          template={template}
          answers={answers}
          verdict={verdict}
          showPhotos={false}
        />

        {template.meta?.disclaimer && (
          <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            {template.meta.disclaimer} Laporan ini diisi sendiri oleh pemeriksa, bukan oleh
            inspektor tersertifikasi.
          </p>
        )}

        <Link
          to="/pilih-mobil"
          className="mt-6 flex min-h-12 items-center justify-center rounded-sm bg-brand px-4 text-[15px] font-semibold text-white active:bg-brand-deep"
        >
          Inspeksi mobil incaranmu sendiri
        </Link>
      </div>
    </div>
  )
}
