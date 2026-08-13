export type ItemSeverity = 'major' | 'minor' | 'addon'
export type InputType = 'boolean' | 'scale' | 'text' | 'photo'
export type AnswerStatus = 'safe' | 'issue' | 'unknown'

export interface ChecklistItem {
  id: string
  label: string
  cara_cek: string
  tanda_bahaya: string
  severity: ItemSeverity
  input_type: InputType
  wajib_foto: boolean
  estimasi_biaya_perbaikan: string
}

export interface ChecklistSection {
  severity: ItemSeverity
  title: string
  deskripsi: string
  items: ChecklistItem[]
}

export interface ChecklistTemplate {
  template_id: string
  version: number
  tier: string
  meta: {
    judul: string
    deskripsi: string
    disclaimer: string
  }
  sections: ChecklistSection[]
}

export interface Vehicle {
  brand: string
  model: string
  year: string
  plate: string
  price: string
}

export interface Answer {
  status: AnswerStatus
  note?: string
  photoName?: string
}

export interface InspectionState {
  vehicle: Vehicle
  answers: Record<string, Answer>
  startedAt: string
  activeSection: number
}
