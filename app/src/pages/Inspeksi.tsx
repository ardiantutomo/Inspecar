import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInspection, saveInspection } from '../lib/storage'
import { buildTemplate, allItems } from '../lib/template'
import { BetaBadge, SeverityBadge } from '../components/SeverityBadge'
import { ItemCard } from '../components/ItemCard'
import { TopBar } from '../components/TopBar'
import type { Answer } from '../types'

export function Inspeksi() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inspection = useMemo(() => (id ? getInspection(id) : undefined), [id])
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    inspection?.answers ?? {},
  )

  if (!inspection) {
    return (
      <NotFound
        text="Inspeksi tidak ditemukan di perangkat ini."
        action={() => navigate('/')}
      />
    )
  }

  const { template } = buildTemplate(inspection.vehicle)
  const items = allItems(template)
  const answeredCount = items.filter((i) => answers[i.id]?.kondisi).length
  const progress = items.length === 0 ? 0 : answeredCount / items.length

  function setAnswer(itemId: string, a: Answer) {
    const next = { ...answers, [itemId]: a }
    setAnswers(next)
    saveInspection({ ...inspection!, answers: next })
  }

  let itemNo = 0

  return (
    <div className="min-h-dvh">
      <TopBar
        title={`${inspection.vehicle.brand} ${inspection.vehicle.model} · ${inspection.vehicle.yearRange}`}
        backTo="/"
        right={
          <span className="num shrink-0 text-xs text-ink-faint">
            {answeredCount}/{items.length}
          </span>
        }
      />
      <div
        className="h-0.5 bg-line-soft"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-label="Progres inspeksi"
      >
        <div
          className="h-full bg-brand transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-xl px-4 pb-32 pt-4">
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">
          Isi sesuai urutan — dokumen dulu, baru kondisi fisik. Buka{' '}
          <span className="font-medium text-ink">"Cara cek"</span> di tiap item bila
          belum tahu caranya. Boleh diisi sebagian; hasil bisa dilihat kapan saja.
        </p>

        {template.sections.map((section, si) => {
          const isBeta = section.tier === 'B'
          return (
            <section key={si} className="mb-7">
              <div className="mb-1 flex items-center gap-2">
                <span className="num text-[11px] text-ink-faint">
                  {String.fromCharCode(65 + si)}
                </span>
                <h2 className="text-base font-semibold tracking-tight">{section.title}</h2>
                {isBeta ? <BetaBadge /> : <SeverityBadge severity={section.severity} />}
              </div>
              {section.deskripsi && (
                <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">
                  {section.deskripsi}
                </p>
              )}
              {isBeta && (
                <p className="mb-3 rounded-sm border border-caution/40 bg-caution-soft px-3 py-2 text-xs leading-relaxed text-ink-soft">
                  Daftar penyakit khas model ini dikumpulkan dari laporan umum dan belum
                  terverifikasi penuh — perlakukan sebagai titik yang perlu dicek ekstra,
                  bukan vonis.
                </p>
              )}
              <div className="space-y-2.5">
                {section.items.map((item) => {
                  itemNo++
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      index={itemNo}
                      answer={answers[item.id] ?? {}}
                      onChange={(a) => setAnswer(item.id, a)}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}

        {template.meta?.disclaimer && (
          <p className="text-xs leading-relaxed text-ink-faint">{template.meta.disclaimer}</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="num text-sm font-semibold">
              {answeredCount}/{items.length} terisi
            </p>
            <p className="truncate text-[11px] text-ink-faint">
              {answeredCount === items.length
                ? 'Semua item selesai'
                : 'Isi minimal item "Penting" untuk hasil akurat'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/hasil/${inspection.id}`)}
            disabled={answeredCount === 0}
            className="flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-brand px-5 text-[15px] font-semibold text-white active:bg-brand-deep disabled:bg-line disabled:text-ink-faint"
          >
            Lihat hasil
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotFound({ text, action }: { text: string; action: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-ink-soft">{text}</p>
      <button
        type="button"
        onClick={action}
        className="rounded-sm border border-line bg-card px-4 py-2.5 text-sm font-medium text-brand"
      >
        Ke halaman utama
      </button>
    </div>
  )
}
