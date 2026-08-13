import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { checklistTemplate, type ChecklistItem } from './data/checklistTemplate'

type Verdict = 'GO' | 'HATI_HATI' | 'NO_GO'
type Level = 'clear' | 'caution' | 'critical'

type Answer = {
  level: Level | null
  note: string
  photoName: string
}

const levelLabel: Record<Level, string> = {
  clear: 'Aman',
  caution: 'Perlu perhatian',
  critical: 'Masalah serius'
}

const scoreMap: Record<Level, number> = {
  clear: 0,
  caution: 1,
  critical: 3
}

const allItems = checklistTemplate.sections.flatMap((section) => section.items)

const defaultAnswer = (): Answer => ({ level: null, note: '', photoName: '' })

function getVerdict(totalScore: number, majorCritical: number): Verdict {
  if (majorCritical >= 3 || totalScore >= 28) {
    return 'NO_GO'
  }

  if (majorCritical >= 1 || totalScore >= 14) {
    return 'HATI_HATI'
  }

  return 'GO'
}

function summarizeVerdict(verdict: Verdict): string {
  if (verdict === 'NO_GO') {
    return 'Risiko tinggi. Sebaiknya tunda transaksi sampai ada verifikasi bengkel independen.'
  }

  if (verdict === 'HATI_HATI') {
    return 'Masih layak dipertimbangkan, tapi masuk dengan strategi negosiasi dan inspeksi lanjutan.'
  }

  return 'Secara umum aman dari indikator kritis utama, lanjutkan verifikasi final sebelum bayar.'
}

function App() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})

  const answeredCount = useMemo(
    () => allItems.filter((item) => answers[item.id]?.level !== null).length,
    [answers]
  )

  const progress = Math.round((answeredCount / allItems.length) * 100)

  const stats = useMemo(() => {
    let majorCritical = 0
    let cautionCount = 0
    let totalScore = 0

    allItems.forEach((item) => {
      const value = answers[item.id]?.level
      if (!value) return
      totalScore += scoreMap[value]
      if (value === 'critical' && item.severity === 'major') majorCritical += 1
      if (value === 'caution') cautionCount += 1
    })

    return { majorCritical, cautionCount, totalScore }
  }, [answers])

  const verdict = getVerdict(stats.totalScore, stats.majorCritical)

  const handleSetLevel = (itemId: string, level: Level) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? defaultAnswer()),
        level
      }
    }))
  }

  const handleSetNote = (itemId: string, note: string) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? defaultAnswer()),
        note
      }
    }))
  }

  const handlePhotoUpload = (event: FormEvent<HTMLInputElement>, itemId: string) => {
    const fileName = event.currentTarget.files?.[0]?.name ?? ''
    setAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? defaultAnswer()),
        photoName: fileName
      }
    }))
  }

  const renderInputHint = (item: ChecklistItem) => {
    if (item.input_type === 'boolean') return 'Mode cepat: pilih aman atau bermasalah.'
    if (item.input_type === 'photo') return 'Unggah foto untuk bukti visual.'
    if (item.input_type === 'text') return 'Isi catatan singkat kondisi di lapangan.'
    return 'Gunakan level untuk menilai tingkat keparahan temuan.'
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Inspeksi mobil bekas</p>
        <h1>{checklistTemplate.meta.judul}</h1>
        <p className="hero-copy">{checklistTemplate.meta.deskripsi}</p>
        <div className="hero-meta">
          <span>Template: {checklistTemplate.template_id}</span>
          <span>Versi: {checklistTemplate.version}</span>
          <span>Tier: {checklistTemplate.tier}</span>
        </div>
      </header>

      <section className="status-strip" aria-label="Progress inspeksi">
        <div>
          <p className="status-label">Progress</p>
          <strong>
            {answeredCount}/{allItems.length} item
          </strong>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className={`verdict verdict-${verdict.toLowerCase()}`}>
        <p className="status-label">Verdict sementara</p>
        <h2>{verdict.replace('_', ' ')}</h2>
        <p>{summarizeVerdict(verdict)}</p>
        <div className="verdict-metrics">
          <span>Temuan major kritis: {stats.majorCritical}</span>
          <span>Temuan caution: {stats.cautionCount}</span>
          <span>Skor risiko: {stats.totalScore}</span>
        </div>
      </section>

      <section className="checklist">
        {checklistTemplate.sections.map((section) => (
          <details key={section.title} open>
            <summary>
              <div>
                <h3>{section.title}</h3>
                <p>{section.deskripsi}</p>
              </div>
              <span className={`severity severity-${section.severity}`}>{section.severity}</span>
            </summary>

            <div className="items">
              {section.items.map((item) => {
                const answer = answers[item.id] ?? defaultAnswer()
                return (
                  <article key={item.id} className="item-card">
                    <div className="item-head">
                      <h4>{item.label}</h4>
                      <span className={`severity severity-${item.severity}`}>{item.severity}</span>
                    </div>
                    <p>
                      <strong>Cara cek:</strong> {item.cara_cek}
                    </p>
                    <p>
                      <strong>Tanda bahaya:</strong> {item.tanda_bahaya}
                    </p>
                    <p className="cost">
                      <strong>Estimasi:</strong> {item.estimasi_biaya_perbaikan}
                    </p>

                    <p className="hint">{renderInputHint(item)}</p>

                    <div className="levels" role="group" aria-label={`Penilaian ${item.label}`}>
                      {(Object.keys(levelLabel) as Level[]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={answer.level === level ? 'active' : ''}
                          onClick={() => handleSetLevel(item.id, level)}
                        >
                          {levelLabel[level]}
                        </button>
                      ))}
                    </div>

                    {(item.input_type === 'text' || item.input_type === 'photo') && (
                      <label className="field">
                        Catatan lapangan
                        <textarea
                          value={answer.note}
                          onChange={(event) => handleSetNote(item.id, event.target.value)}
                          rows={3}
                          placeholder="Tulis temuan singkat agar bisa dipakai untuk negosiasi."
                        />
                      </label>
                    )}

                    {item.input_type === 'photo' && (
                      <label className="field">
                        Upload foto {item.wajib_foto ? '(wajib)' : '(opsional)'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handlePhotoUpload(event, item.id)}
                        />
                        {answer.photoName && <small>File terpilih: {answer.photoName}</small>}
                      </label>
                    )}
                  </article>
                )
              })}
            </div>
          </details>
        ))}
      </section>

      <footer className="disclaimer">
        <p>{checklistTemplate.meta.disclaimer}</p>
      </footer>
    </main>
  )
}

export default App
