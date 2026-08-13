/**
 * Kontrak schema checklist — mengikuti §5 prd.md.
 * Frontend me-render form murni dari struktur ini (dynamic form).
 */

export type Severity = 'major' | 'minor' | 'addon' | 'optional'
export type InputType = 'boolean' | 'scale' | 'text' | 'photo'
export type Tier = 'A' | 'B'
export type Confidence = 'high' | 'medium'

export interface ChecklistItem {
  id: string
  label: string
  cara_cek: string
  tanda_bahaya: string
  severity: Severity
  input_type: InputType
  wajib_foto: boolean
  estimasi_biaya_perbaikan: string
  status?: 'active' | 'optional' | 'hidden' | 'beta'
  /** Hanya untuk item Tier B */
  confidence?: Confidence
  catatan_verifikasi?: string
  tier?: Tier
}

export interface ChecklistSection {
  severity: Severity
  title: string
  deskripsi?: string
  tier?: Tier
  items: ChecklistItem[]
}

export interface ChecklistTemplate {
  template_id: string
  brand: string
  model: string
  year_range: string
  version: number
  tier: Tier
  status: string
  meta?: {
    judul: string
    deskripsi: string
    disclaimer: string
  }
  sections: ChecklistSection[]
}

/** Triase kondisi per item — seragam untuk semua input_type */
export type Kondisi = 'aman' | 'ragu' | 'masalah'

export interface Answer {
  kondisi?: Kondisi
  catatan?: string
  /** dataURL foto terkompresi (disimpan lokal, tidak ikut share link) */
  foto?: string[]
}

export interface Vehicle {
  brand: string
  model: string
  yearRange: string
  /** Tahun / plat / catatan bebas dari user */
  detail?: string
}

export interface Inspection {
  id: string
  vehicle: Vehicle
  createdAt: number
  updatedAt: number
  templateVersion: number
  /** id template Tier B yang ikut digabung (bila ada) */
  tierBId?: string
  answers: Record<string, Answer>
}

export type VerdictLevel = 'go' | 'hati-hati' | 'no-go'

export interface VerdictResult {
  level: VerdictLevel
  headline: string
  reasons: string[]
  dealBreakers: ChecklistItem[]
  majorMasalah: ChecklistItem[]
  majorRagu: ChecklistItem[]
  negoPoints: { item: ChecklistItem; kondisi: Kondisi }[]
  answeredMajor: number
  totalMajor: number
  answeredTotal: number
  totalItems: number
}
