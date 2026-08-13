import type {
  Answer,
  ChecklistItem,
  ChecklistTemplate,
  Kondisi,
  VerdictResult,
} from '../types'
import { allItems } from '../lib/template'

/**
 * Rincian temuan pada report — dikelompokkan seperti triase:
 * temuan serius → perlu dipastikan → bahan nego → yang aman (ringkas).
 */
export function FindingList({
  template,
  answers,
  verdict,
  showPhotos = true,
}: {
  template: ChecklistTemplate
  answers: Record<string, Answer>
  verdict: VerdictResult
  showPhotos?: boolean
}) {
  const items = allItems(template)
  const byKondisi = (k: Kondisi, severity?: 'major' | 'other') =>
    items.filter((i) => {
      if (answers[i.id]?.kondisi !== k) return false
      if (severity === 'major') return i.severity === 'major'
      if (severity === 'other') return i.severity !== 'major'
      return true
    })

  const serius = [...verdict.dealBreakers, ...verdict.majorMasalah]
  const perluCek = byKondisi('ragu')
  const nego = byKondisi('masalah', 'other')
  const aman = byKondisi('aman')

  return (
    <div className="mt-7 space-y-7">
      {serius.length > 0 && (
        <Group
          title="Temuan serius"
          count={serius.length}
          accent="text-critical"
          items={serius}
          answers={answers}
          showPhotos={showPhotos}
        />
      )}
      {perluCek.length > 0 && (
        <Group
          title="Perlu dipastikan sebelum bayar"
          count={perluCek.length}
          accent="text-caution"
          items={perluCek}
          answers={answers}
          showPhotos={showPhotos}
        />
      )}
      {nego.length > 0 && (
        <Group
          title="Temuan ringan — bahan nego"
          count={nego.length}
          accent="text-caution"
          items={nego}
          answers={answers}
          showPhotos={showPhotos}
        />
      )}
      {aman.length > 0 && (
        <section>
          <GroupHeading title="Diperiksa & aman" count={aman.length} accent="text-clear" />
          <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {aman.map((i) => (
              <li key={i.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-clear" />
                <span className="truncate">{i.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function GroupHeading({
  title,
  count,
  accent,
}: {
  title: string
  count: number
  accent: string
}) {
  return (
    <div className="flex items-baseline gap-2 border-b border-line pb-1.5">
      <h2 className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>{title}</h2>
      <span className="num text-xs text-ink-faint">{count}</span>
    </div>
  )
}

function Group({
  title,
  count,
  accent,
  items,
  answers,
  showPhotos,
}: {
  title: string
  count: number
  accent: string
  items: ChecklistItem[]
  answers: Record<string, Answer>
  showPhotos: boolean
}) {
  return (
    <section>
      <GroupHeading title={title} count={count} accent={accent} />
      <ul className="mt-2.5 space-y-2.5">
        {items.map((item) => {
          const ans = answers[item.id]
          return (
            <li key={item.id} className="rounded-card border border-line bg-card p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-snug">{item.label}</p>
                {item.status === 'beta' && (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-caution">
                    beta
                  </span>
                )}
              </div>
              <p className="num mt-1.5 text-xs text-ink-soft">
                Bila bermasalah: {item.estimasi_biaya_perbaikan}
              </p>
              {ans?.catatan && (
                <p className="mt-1.5 border-l-2 border-line-soft pl-2.5 text-[13px] leading-relaxed text-ink-soft">
                  {ans.catatan}
                </p>
              )}
              {showPhotos && ans?.foto && ans.foto.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {ans.foto.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${item.label} — foto ${i + 1}`}
                      className="size-16 rounded-sm border border-line object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
