import { useState } from 'react'
import type { Answer, ChecklistItem } from '../types'
import { TriageButtons } from './TriageButtons'
import { PhotoInput } from './PhotoInput'

export function ItemCard({
  item,
  index,
  answer,
  onChange,
}: {
  item: ChecklistItem
  index: number
  answer: Answer
  onChange: (a: Answer) => void
}) {
  const [showDetail, setShowDetail] = useState(false)
  const answered = answer.kondisi !== undefined
  const isBeta = item.status === 'beta'

  return (
    <div className="rounded-card border border-line bg-card">
      <div className="p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="num mt-0.5 text-[11px] text-ink-faint">
            {String(index).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold leading-snug">{item.label}</h3>
            {isBeta && item.confidence === 'medium' && (
              <p className="mt-0.5 text-xs text-ink-faint">
                Dilaporkan sebagian pemilik — belum tentu berlaku di unit ini.
              </p>
            )}
          </div>
          {answered && (
            <span
              aria-hidden
              className={`mt-1 size-2.5 shrink-0 rounded-full ${
                answer.kondisi === 'aman'
                  ? 'bg-clear'
                  : answer.kondisi === 'ragu'
                    ? 'bg-caution'
                    : 'bg-critical'
              }`}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          aria-expanded={showDetail}
          className="mt-2 flex min-h-8 items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-brand"
        >
          <span
            aria-hidden
            className={`inline-block transition-transform ${showDetail ? 'rotate-90' : ''}`}
          >
            ›
          </span>
          Cara cek & tanda bahaya
        </button>

        {showDetail && (
          <div className="mt-2 space-y-2.5 border-l-2 border-line-soft pl-3 text-sm leading-relaxed">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Cara cek
              </p>
              <p className="text-ink-soft">{item.cara_cek}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-critical">
                Tanda bahaya
              </p>
              <p className="text-ink-soft">{item.tanda_bahaya}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Estimasi bila bermasalah
              </p>
              <p className="num text-[13px] text-ink">{item.estimasi_biaya_perbaikan}</p>
            </div>
          </div>
        )}

        <div className="mt-3">
          <TriageButtons
            value={answer.kondisi}
            onChange={(kondisi) => onChange({ ...answer, kondisi })}
          />
        </div>

        {(item.input_type === 'text' || answer.kondisi === 'ragu' || answer.kondisi === 'masalah') && (
          <textarea
            value={answer.catatan ?? ''}
            onChange={(e) => onChange({ ...answer, catatan: e.target.value })}
            placeholder={
              item.input_type === 'text'
                ? 'Catat hasilnya (mis. angka KM, status pajak)…'
                : 'Catatan temuan (opsional)…'
            }
            rows={2}
            className="mt-2.5 w-full resize-none rounded-sm border border-line bg-surface px-2.5 py-2 text-sm placeholder:text-ink-faint focus:border-brand"
          />
        )}

        {(item.wajib_foto || (answer.foto?.length ?? 0) > 0) && (
          <div className="mt-3">
            <PhotoInput
              photos={answer.foto ?? []}
              required={item.wajib_foto}
              onChange={(foto) => onChange({ ...answer, foto })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
