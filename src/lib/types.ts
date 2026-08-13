export type Severity = "major" | "minor" | "addon";
export type InputType = "boolean" | "scale" | "text" | "photo";
export type Tier = "A" | "B";
export type Confidence = "high" | "medium";

export interface ChecklistItem {
  id: string;
  label: string;
  cara_cek: string;
  tanda_bahaya: string;
  severity: Severity;
  input_type: InputType;
  wajib_foto: boolean;
  estimasi_biaya_perbaikan: string;
  tier: Tier;
  /** Hanya untuk Tier B: seberapa terdokumentasi isu ini. */
  confidence?: Confidence;
  /** Hanya untuk Tier B: alasan singkat kenapa isu ini dianggap valid/umum. */
  catatan_verifikasi?: string;
}

export interface ChecklistSection {
  severity: Severity;
  title: string;
  deskripsi?: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplateMeta {
  judul: string;
  deskripsi: string;
  disclaimer: string;
}

export interface ChecklistTemplate {
  template_id: string;
  brand: string;
  model: string;
  year_range: string;
  version: number;
  status: "published";
  meta: ChecklistTemplateMeta;
  sections: ChecklistSection[];
  /** true bila template mengandung section Tier B (penyakit spesifik model, beta). */
  has_tier_b: boolean;
}

/** Rating triase 3-tingkat yang dipakai user untuk setiap item, terlepas dari input_type. */
export type AnswerStatus = "aman" | "perhatian" | "bermasalah";

export interface ItemAnswer {
  status?: AnswerStatus;
  note?: string;
  photoUrl?: string;
}

export type AnswerMap = Record<string, ItemAnswer>;

export type Verdict = "go" | "hati-hati" | "no-go";

export interface VehicleCatalogEntry {
  brand: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  tierBSlug?: string;
}
