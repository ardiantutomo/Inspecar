import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BRANDS, modelsForBrand } from '../data/catalog'
import { findTierB } from '../data/tierB'
import { newId, saveInspection } from '../lib/storage'
import { TIER_A } from '../lib/template'
import { TopBar } from '../components/TopBar'

export function PilihMobil() {
  const navigate = useNavigate()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [yearRange, setYearRange] = useState('')
  const [manual, setManual] = useState(false)
  const [manualBrand, setManualBrand] = useState('')
  const [manualModel, setManualModel] = useState('')
  const [manualYear, setManualYear] = useState('')
  const [detail, setDetail] = useState('')

  const models = useMemo(() => (brand ? modelsForBrand(brand) : []), [brand])
  const entry = models.find((m) => m.model === model)

  const vehicle = manual
    ? {
        brand: manualBrand.trim(),
        model: manualModel.trim(),
        yearRange: manualYear.trim() || '-',
      }
    : { brand, model, yearRange }

  const ready = manual
    ? vehicle.brand.length > 0 && vehicle.model.length > 0
    : brand !== '' && model !== '' && yearRange !== ''

  const tierB = ready ? findTierB(vehicle.model, vehicle.yearRange) : undefined

  function start() {
    if (!ready) return
    const id = newId()
    saveInspection({
      id,
      vehicle: { ...vehicle, detail: detail.trim() || undefined },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      templateVersion: TIER_A.version,
      tierBId: tierB?.id,
      answers: {},
    })
    navigate(`/inspeksi/${id}`, { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <TopBar title="Pilih mobil" backTo="/" />
      <div className="mx-auto max-w-xl px-4 pb-28 pt-5">
        {!manual ? (
          <>
            <Field label="Merk">
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    selected={brand === b}
                    onClick={() => {
                      setBrand(b)
                      setModel('')
                      setYearRange('')
                    }}
                  />
                ))}
              </div>
            </Field>

            {brand && (
              <Field label="Model">
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <Chip
                      key={m.model}
                      label={m.model}
                      selected={model === m.model}
                      onClick={() => {
                        setModel(m.model)
                        setYearRange('')
                      }}
                    />
                  ))}
                </div>
              </Field>
            )}

            {entry && (
              <Field label="Rentang tahun">
                <div className="flex flex-wrap gap-2">
                  {entry.yearRanges.map((y) => (
                    <Chip
                      key={y}
                      label={y}
                      mono
                      selected={yearRange === y}
                      onClick={() => setYearRange(y)}
                    />
                  ))}
                </div>
              </Field>
            )}

            <button
              type="button"
              onClick={() => setManual(true)}
              className="mt-1 min-h-9 font-mono text-xs uppercase tracking-wider text-brand"
            >
              Mobil tidak ada di daftar? Isi manual ›
            </button>
          </>
        ) : (
          <>
            <Field label="Merk">
              <TextInput value={manualBrand} onChange={setManualBrand} placeholder="mis. Mazda" />
            </Field>
            <Field label="Model">
              <TextInput value={manualModel} onChange={setManualModel} placeholder="mis. CX-5" />
            </Field>
            <Field label="Tahun (opsional)">
              <TextInput value={manualYear} onChange={setManualYear} placeholder="mis. 2015" />
            </Field>
            <p className="mb-4 rounded-sm border border-line bg-card px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
              Model di luar katalog tetap mendapat checklist universal lengkap (banjir, tabrak,
              dokumen, mesin, dst) — hanya tanpa daftar penyakit khas model.
            </p>
            <button
              type="button"
              onClick={() => setManual(false)}
              className="min-h-9 font-mono text-xs uppercase tracking-wider text-brand"
            >
              ‹ Kembali ke daftar
            </button>
          </>
        )}

        {ready && (
          <div className="mt-5">
            <Field label="Catatan unit (opsional)">
              <TextInput
                value={detail}
                onChange={setDetail}
                placeholder="mis. plat B 1234 XX, warna silver"
              />
            </Field>
            {tierB && (
              <p className="rounded-sm border border-brand/30 bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
                Checklist untuk {vehicle.model} {vehicle.yearRange} menyertakan{' '}
                <span className="font-medium text-brand">
                  {tierB.section.items.length} pemeriksaan penyakit khas model
                </span>{' '}
                (berlabel beta).
              </p>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto max-w-xl px-4 py-3">
          <button
            type="button"
            onClick={start}
            disabled={!ready}
            className="flex min-h-12 w-full items-center justify-center rounded-sm bg-brand text-[15px] font-semibold text-white active:bg-brand-deep disabled:bg-line disabled:text-ink-faint"
          >
            {ready
              ? `Mulai inspeksi ${vehicle.brand} ${vehicle.model}`
              : 'Pilih mobil dulu'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </p>
      {children}
    </div>
  )
}

function Chip({
  label,
  selected,
  mono,
  onClick,
}: {
  label: string
  selected: boolean
  mono?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-10 rounded-sm border px-3 text-sm transition-colors ${mono ? 'num' : ''} ${
        selected
          ? 'border-brand bg-brand-soft font-medium text-brand'
          : 'border-line bg-card text-ink-soft active:bg-surface'
      }`}
    >
      {label}
    </button>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-11 w-full rounded-sm border border-line bg-card px-3 text-[15px] placeholder:text-ink-faint focus:border-brand"
    />
  )
}
