export type Severity = "major" | "minor" | "addon" | "optional";
export type InputType = "boolean" | "scale" | "text" | "photo";
export type Tier = "A" | "B";
export type Verdict = "go" | "caution" | "no-go";

export interface ChecklistItem {
  id: string;
  label: string;
  cara_cek: string;
  tanda_bahaya: string;
  severity: Severity;
  input_type: InputType;
  wajib_foto: boolean;
  estimasi_biaya_perbaikan: string;
  status?: "active" | "optional" | "hidden" | "beta";
  confidence?: "high" | "medium";
  catatan_verifikasi?: string;
}

export interface ChecklistSection {
  severity: Severity;
  title: string;
  deskripsi?: string;
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
    judul: string;
    deskripsi: string;
    disclaimer: string;
  };
  sections: ChecklistSection[];
}

export interface VehicleOption {
  brand: string;
  model: string;
  year_range: string;
  label: string;
}

export interface ItemAnswer {
  itemId: string;
  value: boolean | number | string | null;
  photoDataUrl?: string;
  flagged?: boolean;
}

export interface Inspection {
  id: string;
  vehicle: VehicleOption;
  templateId: string;
  templateVersion: number;
  answers: ItemAnswer[];
  createdAt: string;
  completedAt?: string;
}

export interface VerdictResult {
  verdict: Verdict;
  title: string;
  summary: string;
  majorIssues: string[];
  minorIssues: string[];
  unansweredMajor: string[];
}
