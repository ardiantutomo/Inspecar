import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Info,
  Menu,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react'
import rawTemplate from '../checklist-tier-a-universal.json'
import type {
  Answer,
  ChecklistItem,
  ChecklistTemplate,
  InspectionState,
  Vehicle,
} from './types'

type Screen = 'home' | 'vehicle' | 'checklist' | 'report'
type Verdict = 'go' | 'caution' | 'no-go'

const template = rawTemplate as ChecklistTemplate
const STORAGE_KEY = 'inspecar-inspection-v1'

const brands: Record<string, string[]> = {
  Toyota: ['Avanza', 'Innova', 'Rush', 'Agya', 'Yaris'],
  Honda: ['Brio', 'Jazz', 'HR-V', 'CR-V', 'Mobilio'],
  Daihatsu: ['Xenia', 'Terios', 'Ayla', 'Sigra'],
  Suzuki: ['Ertiga', 'Ignis', 'Baleno', 'XL7'],
  Mitsubishi: ['Xpander', 'Pajero Sport', 'Mirage'],
}

const emptyVehicle: Vehicle = {
  brand: '',
  model: '',
  year: '',
  plate: '',
  price: '',
}

function readSavedInspection(): InspectionState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as InspectionState) : null
  } catch {
    return null
  }
}

function saveInspection(state: InspectionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function formatRupiah(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }
  return `Rp ${Math.round(value / 1_000).toLocaleString('id-ID')} rb`
}

function extractMinimumCost(text: string) {
  const match = text.match(/Rp\s*([\d,.]+)\s*(rb|jt)/i)
  if (!match) return 0
  const numeric = Number(match[1].replace(',', '.'))
  return numeric * (match[2].toLowerCase() === 'jt' ? 1_000_000 : 1_000)
}

function Header({
  compact = false,
  onHome,
}: {
  compact?: boolean
  onHome: () => void
}) {
  return (
    <header className={`site-header ${compact ? 'compact' : ''}`}>
      <button className="brand-lockup" onClick={onHome} aria-label="Ke beranda">
        <span className="brand-mark"><CarFront size={20} /></span>
        <span>INSPECAR</span>
      </button>
      {!compact && (
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#yang-diperiksa">Yang diperiksa</a>
          <span className="trust-chip"><ShieldCheck size={15} /> Checklist terverifikasi</span>
        </nav>
      )}
      {compact && <span className="save-state"><Check size={14} /> Tersimpan otomatis</span>}
      {!compact && <button className="mobile-menu" aria-label="Buka menu"><Menu /></button>}
    </header>
  )
}

function Home({
  onStart,
  saved,
  onContinue,
}: {
  onStart: () => void
  saved: InspectionState | null
  onContinue: () => void
}) {
  return (
    <>
      <Header onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> PANDUAN INSPEKSI MOBIL BEKAS</div>
            <h1>Periksa sebelum<br /><em>percaya.</em></h1>
            <p className="hero-lead">
              Panduan langkah demi langkah untuk menemukan tanda banjir, bekas tabrak,
              masalah mesin, dan risiko dokumen—meski kamu bukan montir.
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={onStart}>
                Mulai inspeksi gratis <ArrowRight size={18} />
              </button>
              <span className="helper"><Clock3 size={16} /> Sekitar 25 menit · tanpa akun</span>
            </div>
            {saved && (
              <button className="continue-card" onClick={onContinue}>
                <span><strong>Lanjutkan inspeksi {saved.vehicle.brand} {saved.vehicle.model}</strong>
                <small>{Object.keys(saved.answers).length} titik sudah diperiksa</small></span>
                <ArrowRight size={19} />
              </button>
            )}
          </div>
          <div className="diagnostic-sheet" aria-label="Contoh hasil inspeksi">
            <div className="sheet-topline">
              <div><small>HASIL PEMERIKSAAN</small><strong>Toyota Avanza</strong></div>
              <span className="mono">2019 · B 1842 KZ</span>
            </div>
            <div className="verdict-stamp caution">
              <div><TriangleAlert size={24} /><span>VERDICT</span></div>
              <strong>PERLU<br />PERTIMBANGAN</strong>
              <p>2 temuan penting perlu diperiksa lebih lanjut</p>
            </div>
            <div className="metric-row">
              <div><span className="metric-icon safe"><Check size={18} /></span><strong>21</strong><small>Aman</small></div>
              <div><span className="metric-icon warn"><TriangleAlert size={17} /></span><strong>4</strong><small>Perlu perhatian</small></div>
              <div><span className="metric-icon danger"><X size={18} /></span><strong>2</strong><small>Masalah serius</small></div>
            </div>
            <div className="finding">
              <span className="severity-bar danger" />
              <div><small>TEMUAN UTAMA</small><strong>Rembesan oli di area mesin</strong><p>Perlu diagnosa bengkel sebelum transaksi</p></div>
              <span className="cost mono">Rp 0,5–3 jt</span>
            </div>
            <div className="finding">
              <span className="severity-bar warn" />
              <div><small>BAHAN NEGOSIASI</small><strong>Ban depan aus tidak merata</strong><p>Periksa spooring dan kaki-kaki</p></div>
              <span className="cost mono">Rp 0,5–2 jt</span>
            </div>
            <div className="sheet-footer"><ShieldCheck size={15} /> Checklist universal · Versi {template.version}</div>
          </div>
        </section>

        <section className="trust-strip">
          <div><strong>27</strong><span>Titik pemeriksaan</span></div>
          <div><strong>9</strong><span>Bagian kendaraan</span></div>
          <div><strong>100%</strong><span>Data tetap di perangkatmu</span></div>
        </section>

        <section className="process-section" id="cara-kerja">
          <div className="section-heading">
            <span className="eyebrow"><span /> CARA KERJA</span>
            <h2>Satu alur. Keputusan lebih tenang.</h2>
            <p>Kami mengubah inspeksi yang rumit menjadi langkah kecil yang jelas.</p>
          </div>
          <div className="process-grid">
            <article><span className="step-number mono">01</span><CarFront /><h3>Catat kendaraannya</h3><p>Masukkan merk, model, tahun, dan harga penawaran sebagai konteks inspeksi.</p></article>
            <article><span className="step-number mono">02</span><ClipboardCheck /><h3>Ikuti panduan cek</h3><p>Setiap titik menjelaskan cara memeriksa dan tanda bahaya yang perlu dicari.</p></article>
            <article><span className="step-number mono">03</span><FileCheck2 /><h3>Baca hasilnya</h3><p>Dapatkan verdict, temuan prioritas, dan perkiraan biaya untuk bahan negosiasi.</p></article>
          </div>
        </section>

        <section className="coverage-section" id="yang-diperiksa">
          <div>
            <span className="eyebrow light"><span /> CHECKLIST UNIVERSAL</span>
            <h2>Hal penting yang sering luput saat jatuh hati pada mobil.</h2>
          </div>
          <div className="coverage-list">
            {template.sections.slice(0, 6).map((section, index) => (
              <div key={section.title}><span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <strong>{section.title}</strong><small>{section.items.length} titik pemeriksaan</small></div>
            ))}
          </div>
        </section>
      </main>
      <footer><div className="brand-lockup"><span className="brand-mark"><CarFront size={20} /></span><span>INSPECAR</span></div>
        <p>Alat bantu keputusan, bukan pengganti pemeriksaan montir profesional.</p></footer>
    </>
  )
}

function VehicleForm({
  onBack,
  onSubmit,
}: {
  onBack: () => void
  onSubmit: (vehicle: Vehicle) => void
}) {
  const [vehicle, setVehicle] = useState<Vehicle>(emptyVehicle)
  const valid = vehicle.brand && vehicle.model && vehicle.year
  const update = (field: keyof Vehicle, value: string) => {
    setVehicle((current) => ({
      ...current,
      [field]: value,
      ...(field === 'brand' ? { model: '' } : {}),
    }))
  }

  return (
    <div className="app-shell">
      <Header compact onHome={onBack} />
      <main className="form-page">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali</button>
        <div className="form-intro">
          <span className="step-label mono">LANGKAH 1 DARI 2</span>
          <h1>Mobil apa yang akan diperiksa?</h1>
          <p>Data ini dipakai untuk memberi konteks pada hasil inspeksi. Hanya merk, model, dan tahun yang wajib.</p>
        </div>
        <form className="vehicle-form" onSubmit={(event) => { event.preventDefault(); if (valid) onSubmit(vehicle) }}>
          <label>Merk mobil <span>*</span>
            <select value={vehicle.brand} onChange={(e) => update('brand', e.target.value)} required>
              <option value="">Pilih merk</option>
              {Object.keys(brands).map((brand) => <option key={brand}>{brand}</option>)}
            </select>
          </label>
          <label>Model <span>*</span>
            <select value={vehicle.model} onChange={(e) => update('model', e.target.value)} required disabled={!vehicle.brand}>
              <option value="">Pilih model</option>
              {(brands[vehicle.brand] ?? []).map((model) => <option key={model}>{model}</option>)}
            </select>
          </label>
          <div className="field-grid">
            <label>Tahun <span>*</span>
              <input type="number" min="1980" max={new Date().getFullYear()} placeholder="Contoh: 2019"
                value={vehicle.year} onChange={(e) => update('year', e.target.value)} required />
            </label>
            <label>Nomor polisi <small>Opsional</small>
              <input placeholder="B 1234 XYZ" value={vehicle.plate} onChange={(e) => update('plate', e.target.value.toUpperCase())} />
            </label>
          </div>
          <label>Harga penawaran <small>Opsional</small>
            <div className="currency-input"><span>Rp</span><input inputMode="numeric" placeholder="185.000.000"
              value={vehicle.price} onChange={(e) => update('price', e.target.value.replace(/[^\d.]/g, ''))} /></div>
          </label>
          <div className="privacy-note"><ShieldCheck size={19} /><div><strong>Data tetap di perangkat ini</strong>
            <p>Versi MVP ini menyimpan progres secara lokal dan tidak mengirim data kendaraan ke server.</p></div></div>
          <button className="button primary full" disabled={!valid}>Mulai periksa mobil <ArrowRight size={18} /></button>
        </form>
      </main>
    </div>
  )
}

function Checklist({
  state,
  onChange,
  onBack,
  onReport,
}: {
  state: InspectionState
  onChange: (state: InspectionState) => void
  onBack: () => void
  onReport: () => void
}) {
  const section = template.sections[state.activeSection]
  const totalItems = template.sections.flatMap((item) => item.items).length
  const answered = Object.keys(state.answers).length
  const progress = Math.round((answered / totalItems) * 100)

  const setAnswer = (id: string, answer: Answer) => {
    const next = { ...state, answers: { ...state.answers, [id]: answer } }
    saveInspection(next)
    onChange(next)
  }
  const goToSection = (index: number) => {
    const next = { ...state, activeSection: index }
    saveInspection(next)
    onChange(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Header compact onHome={onBack} />
      <div className="checklist-layout">
        <aside className="section-nav">
          <div className="vehicle-mini"><small>SEDANG DIPERIKSA</small><strong>{state.vehicle.brand} {state.vehicle.model}</strong>
            <span className="mono">{state.vehicle.year} {state.vehicle.plate && `· ${state.vehicle.plate}`}</span></div>
          <div className="overall-progress"><span><strong>{progress}%</strong><small>{answered} dari {totalItems} selesai</small></span>
            <div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>
          <nav aria-label="Bagian checklist">
            {template.sections.map((item, index) => {
              const complete = item.items.every((check) => state.answers[check.id])
              return <button key={item.title} className={index === state.activeSection ? 'active' : ''} onClick={() => goToSection(index)}>
                <span>{complete ? <Check size={14} /> : index + 1}</span><div><strong>{item.title}</strong>
                <small>{item.items.filter((check) => state.answers[check.id]).length}/{item.items.length} diperiksa</small></div></button>
            })}
          </nav>
        </aside>

        <main className="checklist-content">
          <div className="mobile-progress">
            <span>Bagian {state.activeSection + 1} dari {template.sections.length}</span><strong>{progress}% selesai</strong>
            <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="checklist-heading">
            <div><span className={`severity-label ${section.severity}`}>{section.severity === 'major' ? 'PEMERIKSAAN UTAMA' : 'PEMERIKSAAN LANJUTAN'}</span>
              <h1>{section.title}</h1><p>{section.deskripsi}</p></div>
            <span className="section-count mono">{String(state.activeSection + 1).padStart(2, '0')} / {String(template.sections.length).padStart(2, '0')}</span>
          </div>

          <div className="check-items">
            {section.items.map((item, index) => (
              <ChecklistCard key={item.id} item={item} index={index} answer={state.answers[item.id]}
                onAnswer={(answer) => setAnswer(item.id, answer)} />
            ))}
          </div>

          <div className="checklist-actions">
            <button className="button secondary" disabled={state.activeSection === 0} onClick={() => goToSection(state.activeSection - 1)}>
              <ArrowLeft size={18} /> Sebelumnya
            </button>
            {state.activeSection < template.sections.length - 1 ? (
              <button className="button primary" onClick={() => goToSection(state.activeSection + 1)}>Bagian berikutnya <ArrowRight size={18} /></button>
            ) : (
              <button className="button primary" onClick={onReport}>Lihat hasil inspeksi <FileCheck2 size={18} /></button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function ChecklistCard({
  item,
  index,
  answer,
  onAnswer,
}: {
  item: ChecklistItem
  index: number
  answer?: Answer
  onAnswer: (answer: Answer) => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  return (
    <article className={`check-card ${answer ? `answered ${answer.status}` : ''}`}>
      <div className="check-card-title">
        <span className="item-number mono">{String(index + 1).padStart(2, '0')}</span>
        <div><h2>{item.label}</h2><div className="item-tags">
          <span className={`severity-dot ${item.severity}`}>{item.severity === 'major' ? 'Penting' : 'Perhatian'}</span>
          {item.wajib_foto && <span><Camera size={13} /> Foto disarankan</span>}
        </div></div>
      </div>
      <button className="instruction-toggle" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen}>
        <span><Info size={16} /> Cara memeriksa & tanda bahaya</span><ChevronDown size={18} className={detailsOpen ? 'rotated' : ''} />
      </button>
      {detailsOpen && <div className="instructions">
        <div><strong>Cara memeriksa</strong><p>{item.cara_cek}</p></div>
        <div className="danger-instruction"><strong><TriangleAlert size={15} /> Tanda bahaya</strong><p>{item.tanda_bahaya}</p></div>
        <div className="cost-estimate"><span>Perkiraan dampak/biaya</span><strong className="mono">{item.estimasi_biaya_perbaikan}</strong></div>
      </div>}
      <div className="answer-options" role="group" aria-label={`Hasil untuk ${item.label}`}>
        <button className={answer?.status === 'safe' ? 'selected safe' : ''} onClick={() => onAnswer({ ...answer, status: 'safe' })}>
          <CheckCircle2 size={20} /><span><strong>Aman</strong><small>Tidak ada tanda bahaya</small></span>
        </button>
        <button className={answer?.status === 'issue' ? 'selected issue' : ''} onClick={() => onAnswer({ ...answer, status: 'issue' })}>
          <CircleAlert size={20} /><span><strong>Ada masalah</strong><small>Gejala ditemukan</small></span>
        </button>
        <button className={answer?.status === 'unknown' ? 'selected unknown' : ''} onClick={() => onAnswer({ ...answer, status: 'unknown' })}>
          <span className="question">?</span><span><strong>Belum yakin</strong><small>Perlu bantuan ahli</small></span>
        </button>
      </div>
      {answer?.status === 'issue' && (
        <textarea className="finding-note" value={answer.note ?? ''} onChange={(e) => onAnswer({ ...answer, note: e.target.value })}
          placeholder="Catat gejala yang kamu temukan (opsional)" aria-label={`Catatan untuk ${item.label}`} />
      )}
      {item.wajib_foto && (
        <label className="photo-input"><Camera size={17} /><span>{answer?.photoName || 'Tambahkan foto bukti'}</span>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onAnswer({ status: answer?.status ?? 'unknown', note: answer?.note, photoName: file.name })
          }} /></label>
      )}
    </article>
  )
}

function Report({
  state,
  onBack,
  onReset,
}: {
  state: InspectionState
  onBack: () => void
  onReset: () => void
}) {
  const allItems = template.sections.flatMap((section) => section.items)
  const findings = allItems.filter((item) => state.answers[item.id]?.status === 'issue')
  const unknowns = allItems.filter((item) => state.answers[item.id]?.status === 'unknown')
  const safeCount = allItems.filter((item) => state.answers[item.id]?.status === 'safe').length
  const unanswered = allItems.length - safeCount - findings.length - unknowns.length
  const majorFindings = findings.filter((item) => item.severity === 'major')
  const dealbreaker = majorFindings.some((item) => /batalkan|bodong|disita|keamanan/i.test(`${item.tanda_bahaya} ${item.estimasi_biaya_perbaikan}`))
  const verdict: Verdict = dealbreaker || majorFindings.length >= 3 ? 'no-go' : findings.length || unknowns.length || unanswered ? 'caution' : 'go'
  const estimatedMinimum = findings.reduce((sum, item) => sum + extractMinimumCost(item.estimasi_biaya_perbaikan), 0)

  const verdictCopy = {
    go: { title: 'LAYAK DILANJUTKAN', body: 'Tidak ada tanda bahaya dari titik yang diperiksa. Tetap lakukan pemeriksaan bengkel sebelum transaksi.' },
    caution: { title: 'PERLU PERTIMBANGAN', body: 'Ada temuan atau pemeriksaan yang belum pasti. Minta diagnosa bengkel dan gunakan biaya sebagai bahan negosiasi.' },
    'no-go': { title: 'SEBAIKNYA JANGAN LANJUT', body: 'Ditemukan risiko besar yang dapat menyangkut legalitas, keselamatan, atau biaya perbaikan tinggi.' },
  }[verdict]

  return (
    <div className="app-shell report-shell">
      <Header compact onHome={onBack} />
      <main className="report-page">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Kembali ke checklist</button>
        <div className="report-title">
          <div><span className="step-label mono">HASIL INSPEKSI · {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
            <h1>{state.vehicle.brand} {state.vehicle.model} <em>{state.vehicle.year}</em></h1>
            <p className="mono">{state.vehicle.plate || 'Nomor polisi tidak dicatat'}</p></div>
          <span className="report-id mono">TEMPLATE v{template.version}</span>
        </div>

        <section className={`report-verdict ${verdict}`}>
          <div className="verdict-seal">{verdict === 'go' ? <CheckCircle2 /> : verdict === 'no-go' ? <X /> : <TriangleAlert />}
            <small>VERDICT INSPEKSI</small><strong>{verdictCopy.title}</strong></div>
          <p>{verdictCopy.body}</p>
        </section>

        <div className="report-metrics">
          <div><span className="metric-icon safe"><Check /></span><strong>{safeCount}</strong><p>Aman</p></div>
          <div><span className="metric-icon danger"><CircleAlert /></span><strong>{findings.length}</strong><p>Temuan</p></div>
          <div><span className="metric-icon warn">?</span><strong>{unknowns.length + unanswered}</strong><p>Belum pasti</p></div>
          <div className="cost-total"><small>MINIMUM BIAYA TERIDENTIFIKASI</small><strong className="mono">{estimatedMinimum ? formatRupiah(estimatedMinimum) : 'Belum ada'}</strong></div>
        </div>

        {findings.length > 0 ? (
          <section className="report-section">
            <div className="report-section-heading"><div><span className="eyebrow"><span /> TEMUAN</span><h2>Yang perlu ditindaklanjuti</h2></div>
              <span>{findings.length} temuan</span></div>
            <div className="report-findings">
              {findings.map((item) => (
                <article key={item.id} className={item.severity}>
                  <div className="finding-priority"><span>{item.severity === 'major' ? 'RISIKO UTAMA' : 'BAHAN NEGO'}</span>
                    <strong>{item.label}</strong><p>{state.answers[item.id].note || item.tanda_bahaya}</p></div>
                  <div className="finding-action"><small>LANGKAH BERIKUTNYA</small><p>{item.severity === 'major' ? 'Minta pemeriksaan bengkel sebelum transaksi.' : 'Konfirmasi biaya dan negosiasikan harga.'}</p>
                    <strong className="mono">{item.estimasi_biaya_perbaikan}</strong></div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="empty-findings"><CheckCircle2 /><div><h2>Belum ada masalah yang dicatat</h2>
            <p>Pastikan semua bagian sudah diperiksa agar verdict lebih lengkap.</p></div></section>
        )}

        <section className="disclaimer"><Info size={20} /><p><strong>Batasan hasil:</strong> {template.meta.disclaimer} Aplikasi tidak dapat memverifikasi riwayat kendaraan atau menjamin tidak ada kerusakan tersembunyi.</p></section>
        <div className="report-actions">
          <button className="button secondary" onClick={() => window.print()}><FileCheck2 size={18} /> Cetak / simpan PDF</button>
          <button className="button ghost-danger" onClick={onReset}><RotateCcw size={17} /> Mulai inspeksi baru</button>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const savedOnLoad = useMemo(() => readSavedInspection(), [])
  const [screen, setScreen] = useState<Screen>('home')
  const [inspection, setInspection] = useState<InspectionState | null>(savedOnLoad)

  const startInspection = (vehicle: Vehicle) => {
    const state: InspectionState = { vehicle, answers: {}, startedAt: new Date().toISOString(), activeSection: 0 }
    saveInspection(state)
    setInspection(state)
    setScreen('checklist')
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setInspection(null)
    setScreen('vehicle')
    window.scrollTo({ top: 0 })
  }

  if (screen === 'vehicle') return <VehicleForm onBack={() => setScreen('home')} onSubmit={startInspection} />
  if (screen === 'checklist' && inspection) return <Checklist state={inspection} onChange={setInspection} onBack={() => setScreen('home')} onReport={() => setScreen('report')} />
  if (screen === 'report' && inspection) return <Report state={inspection} onBack={() => setScreen('checklist')} onReset={reset} />
  return <Home saved={inspection} onStart={() => setScreen('vehicle')} onContinue={() => setScreen('checklist')} />
}
