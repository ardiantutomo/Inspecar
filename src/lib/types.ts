export type Severity = "major" | "minor" | "addon" | "optional";
export type InputType = "boolean" | "scale" | "text" | "photo";
export type ItemStatus = "active" | "optional" | "hidden" | "beta";
export type Tier = "A" | "B";
export type Verdict = "go" | "hati-hati" | "no-go";

export interface ChecklistItem {
  id: string;
  label: string;
  cara_cek: string;
  tanda_bahaya: string;
  severity: Severity;
  input_type: InputType;
  wajib_foto: boolean;
  estimasi_biaya_perbaikan: string;
  status?: ItemStatus;
  confidence?: "high" | "medium";
  catatan_verifikasi?: string;
}

export interface ChecklistSection {
  severity: Severity;
  title: string;
  deskripsi?: string;
  tier?: Tier;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  template_id: string;
  brand: string;
  model: string;
  year_range: string;
  version: number;
  tier: Tier;
  status: string;
  meta?: {
    judul?: string;
    deskripsi?: string;
    disclaimer?: string;
  };
  sections: ChecklistSection[];
}

export interface VehicleCatalogEntry {
  id: string;
  brand: string;
  model: string;
  year_range: string;
  popular?: boolean;
}

export type AnswerValue = boolean | number | string | null;

export interface ItemAnswer {
  value: AnswerValue;
  note?: string;
  photoDataUrl?: string;
  flaggedIrrelevant?: boolean;
}

export interface InspectionAnswers {
  [itemId: string]: ItemAnswer;
}

export interface Inspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  brand: string;
  model: string;
  year_range: string;
  year?: number;
  plate?: string;
  sellerNote?: string;
  template_id: string;
  template_version: number;
  answers: InspectionAnswers;
  unlocked: boolean;
  currentSectionIndex: number;
}

export interface Finding {
  itemId: string;
  label: string;
  sectionTitle: string;
  severity: Severity;
  tier: Tier;
  level: "critical" | "caution" | "ok" | "unknown";
  detail: string;
  estimasi: string;
  isDealBreaker: boolean;
}

export interface InspectionSummary {
  verdict: Verdict;
  score: number;
  criticalCount: number;
  cautionCount: number;
  okCount: number;
  unansweredCount: number;
  findings: Finding[];
  negoPoints: string[];
  disclaimer: string;
}
