import { useEffect, useMemo, useState } from 'react'
import template from '../checklist-tier-a-universal.json'

type Answer = { value?: string; note?: string; photo?: string }
type Answers = Record<string, Answer>
type Stage = 'welcome' | 'checklist' | 'report'

const vehicles = [
  ['Toyota', 'Avanza', '2018'],
  ['Honda', 'Brio', '2020'],
  ['Toyota', 'Innova', '2016'],
  ['Suzuki', 'Ertiga', '2019'],
]

const severityLabel: Record<string, string> = { major: 'Prioritas tinggi', minor: 'Perlu diperhatikan' }

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [vehicle, setVehicle] = useState({ brand: 'Toyota', model: 'Avanza', year: '2018', plate: '' })
  const [answers, setAnswers] = useState<Answers>({})
  const [openSection, setOpenSection] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('inspecar-draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnswers(parsed.answers ?? {})
        setVehicle(parsed.vehicle ?? vehicle)
      } catch { /* Ignore an invalid local draft. */ }
    }
  }, [])

  useEffect(() => {
    if (stage !== 'welcome') localStorage.setItem('inspecar-draft', JSON.stringify({ vehicle, answers }))
  }, [answers, vehicle, stage])

  const items = template.sections.flatMap((section) => section.items)
  const answered = items.filter((item) => answers[item.id]?.value).length
  const flagged = items.filter((item) => {
    const value = answers[item.id]?.value
    return value === 'problem' || Number(value) >= 3
  })
  const majorFlags = flagged.filter((item) => item.severity === 'major')
  const progress = Math.round((answered / items.length) * 100)
  const verdict = majorFlags.length > 0 ? 'NO-GO' : flagged.length > 2 ? 'HATI-HATI' : answered === items.length ? 'LAYAK DILANJUTKAN' : 'BELUM LENGKAP'

  const updateAnswer = (id: string, update: Partial<Answer>) =>
    setAnswers((current) => ({ ...current, [id]: { ...current[id], ...update } }))

  const startInspection = () => {
    setStage('checklist')
    setOpenSection(0)
  }

  const chooseVehicle = (value: string) => {
    const [brand, model, year] = value.split('|')
    setVehicle((current) => ({ ...current, brand, model, year }))
  }

  if (stage === 'report') {
    return <Report vehicle={vehicle} flagged={flagged} verdict={verdict} onBack={() => setStage('checklist')} onNew={() => { setAnswers({}); setStage('welcome') }} />
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setStage('welcome')} aria-label="Kembali ke beranda">
          <span className="brand-mark">I</span><span>inspecar</span>
        </button>
        {stage === 'checklist' && <span className="draft-status"><i />Tersimpan di perangkat</span>}
      </header>

      {stage === 'welcome' ? (
        <section className="welcome shell">
          <div className="eyebrow">PANDUAN INSPEKSI MOBIL BEKAS</div>
          <h1>Jangan ambil keputusan<br />hanya dari <em>tampilan.</em></h1>
          <p className="lede">Ikuti pemeriksaan penting saat melihat mobil. Catat temuannya, lalu bawa pulang dasar yang jelas untuk negosiasi atau keputusan batal.</p>
          <div className="trust-row">
            <div><strong>26</strong><span>titik pemeriksaan</span></div>
            <div><strong>9</strong><span>area penting</span></div>
            <div><strong>±20 mnt</strong><span>waktu di lokasi</span></div>
          </div>

          <section className="vehicle-card" aria-labelledby="vehicle-title">
            <div className="section-kicker">01 — kendaraan</div>
            <h2 id="vehicle-title">Mobil yang akan dicek</h2>
            <p>Pilih kendaraan terlebih dahulu. Checklist universal berlaku untuk semua mobil bekas.</p>
            <label>Model populer
              <select value={`${vehicle.brand}|${vehicle.model}|${vehicle.year}`} onChange={(event) => chooseVehicle(event.target.value)}>
                {vehicles.map(([brand, model, year]) => <option key={`${brand}${model}${year}`} value={`${brand}|${model}|${year}`}>{brand} {model} · {year}</option>)}
              </select>
            </label>
            <div className="two-col">
              <label>Nomor polisi <input value={vehicle.plate} placeholder="Contoh: B 1234 ABC" onChange={(event) => setVehicle({ ...vehicle, plate: event.target.value })} /></label>
              <div className="vehicle-readout"><span>CHECKLIST</span><strong>Tier A · Terverifikasi</strong></div>
            </div>
            <button className="primary" onClick={startInspection}>Mulai inspeksi <span>→</span></button>
          </section>
          <p className="quiet-note">Tidak perlu akun untuk mulai. Data inspeksi tersimpan hanya di perangkat ini.</p>
        </section>
      ) : (
        <section className="checklist shell">
          <div className="inspection-heading">
            <div>
              <div className="eyebrow">INSPEKSI AKTIF</div>
              <h1>{vehicle.brand} {vehicle.model} <span>· {vehicle.year}</span></h1>
              {vehicle.plate && <p className="mono">{vehicle.plate}</p>}
            </div>
            <button className="text-button" onClick={() => setStage('welcome')}>Ubah kendaraan</button>
          </div>
          <div className="progress-wrap" aria-label={`${progress}% selesai`}>
            <div className="progress-label"><span>{answered} dari {items.length} titik diperiksa</span><strong>{progress}%</strong></div>
            <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="notice"><span>ⓘ</span><p>Fokus pada temuan yang bisa kamu lihat atau rasakan. Jika ragu, pilih <b>Belum dicek</b> dan tanyakan ke bengkel.</p></div>
          <div className="sections">
            {template.sections.map((section, index) => {
              const sectionAnswered = section.items.filter((item) => answers[item.id]?.value).length
              const isOpen = openSection === index
              return <article className={`check-section ${isOpen ? 'is-open' : ''}`} key={section.title}>
                <button className="section-toggle" onClick={() => setOpenSection(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span className={`severity-dot ${section.severity}`} />
                  <span className="section-title"><small>{severityLabel[section.severity]}</small><strong>{section.title}</strong></span>
                  <span className="section-count">{sectionAnswered}/{section.items.length}</span><span className="chevron">⌄</span>
                </button>
                {isOpen && <div className="section-content">
                  <p className="section-description">{section.deskripsi}</p>
                  {section.items.map((item) => <CheckItem key={item.id} item={item} answer={answers[item.id]} onChange={(update) => updateAnswer(item.id, update)} />)}
                  <button className="next-section" onClick={() => setOpenSection(Math.min(index + 1, template.sections.length - 1))}>
                    Lanjut ke {template.sections[Math.min(index + 1, template.sections.length - 1)].title} <span>→</span>
                  </button>
                </div>}
              </article>
            })}
          </div>
          <div className="sticky-action">
            <div><span>{flagged.length ? `${flagged.length} temuan perlu perhatian` : 'Belum ada temuan bermasalah'}</span><strong>{answered}/{items.length} diperiksa</strong></div>
            <button className="primary" disabled={answered === 0} onClick={() => setStage('report')}>Lihat ringkasan <span>→</span></button>
          </div>
        </section>
      )}
    </main>
  )
}

function CheckItem({ item, answer, onChange }: { item: typeof template.sections[number]['items'][number]; answer?: Answer; onChange: (update: Partial<Answer>) => void }) {
  const value = answer?.value ?? ''
  return <div className="check-item">
    <div className="item-head"><div><span className={`severity-tag ${item.severity}`}>{item.severity === 'major' ? 'UTAMA' : 'RINGAN'}</span><h3>{item.label}</h3></div>{item.wajib_foto && <span className="photo-required">Foto disarankan</span>}</div>
    <details><summary>Cara memeriksa <span>+</span></summary><div><p>{item.cara_cek}</p><p className="danger"><b>Tanda bahaya:</b> {item.tanda_bahaya}</p><p className="cost">Estimasi: {item.estimasi_biaya_perbaikan}</p></div></details>
    {item.input_type === 'boolean' ? <div className="choice-row" role="group" aria-label={item.label}>
      <button className={value === 'clear' ? 'selected clear' : ''} onClick={() => onChange({ value: 'clear' })}>Aman</button>
      <button className={value === 'problem' ? 'selected critical' : ''} onClick={() => onChange({ value: 'problem' })}>Ada masalah</button>
      <button className={value === 'unknown' ? 'selected' : ''} onClick={() => onChange({ value: 'unknown' })}>Belum dicek</button>
    </div> : item.input_type === 'scale' ? <div className="scale-row" role="group" aria-label={item.label}>
      {[['1', 'Normal'], ['2', 'Ringan'], ['3', 'Terasa'], ['4', 'Parah']].map(([score, label]) => <button key={score} className={value === score ? `selected score-${score}` : ''} onClick={() => onChange({ value: score })}><b>{score}</b><span>{label}</span></button>)}
    </div> : <label className="item-input">Catatan hasil cek<textarea rows={2} value={value} placeholder="Contoh: pajak mati sejak 2023" onChange={(event) => onChange({ value: event.target.value })} /></label>}
    <label className="note-input">Catatan tambahan <input value={answer?.note ?? ''} placeholder="Opsional" onChange={(event) => onChange({ note: event.target.value })} /></label>
  </div>
}

function Report({ vehicle, flagged, verdict, onBack, onNew }: { vehicle: { brand: string; model: string; year: string; plate: string }; flagged: typeof template.sections[number]['items']; verdict: string; onBack: () => void; onNew: () => void }) {
  const critical = verdict === 'NO-GO'
  const caution = verdict === 'HATI-HATI'
  const summary = critical ? 'Ada temuan prioritas tinggi yang perlu ditangani sebelum transaksi.' : caution ? 'Kondisi perlu dinegosiasikan atau diperiksa lebih lanjut.' : verdict === 'LAYAK DILANJUTKAN' ? 'Tidak ada temuan berat dari pemeriksaan mandiri ini.' : 'Lengkapi pemeriksaan untuk mendapat rekomendasi.'
  return <main><header className="topbar"><button className="brand" onClick={onNew}><span className="brand-mark">I</span><span>inspecar</span></button><button className="text-button" onClick={onBack}>Kembali ke checklist</button></header>
    <section className="report shell">
      <div className="eyebrow">RINGKASAN INSPEKSI</div><h1>{vehicle.brand} {vehicle.model} <span>· {vehicle.year}</span></h1><p className="mono">{vehicle.plate || 'Nomor polisi belum dicatat'} · Template universal v{template.version}</p>
      <div className={`verdict ${critical ? 'critical' : caution ? 'caution' : 'clear'}`}><span>REKOMENDASI AWAL</span><strong>{verdict}</strong><p>{summary}</p></div>
      <section className="report-list"><div className="report-list-head"><h2>Temuan yang perlu ditindaklanjuti</h2><span>{flagged.length} temuan</span></div>
      {flagged.length ? flagged.map((item) => <div className="finding" key={item.id}><span className={`severity-dot ${item.severity}`} /><div><strong>{item.label}</strong><p>{item.tanda_bahaya}</p></div><span className="cost">{item.estimasi_biaya_perbaikan}</span></div>) : <p className="empty">Belum ada temuan yang ditandai bermasalah. Pastikan semua titik sudah diperiksa sebelum membuat keputusan.</p>}</section>
      <div className="disclaimer"><b>Catatan penting</b><p>{template.meta.disclaimer}</p></div>
      <div className="report-actions"><button className="secondary" onClick={onBack}>Periksa lagi</button><button className="primary" onClick={() => window.print()}>Cetak ringkasan <span>↗</span></button></div>
    </section></main>
}

export default App
