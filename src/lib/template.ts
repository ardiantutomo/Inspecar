import tierAJson from "@/data/tier-a-universal.json";
import tierBAvanza from "@/data/tier-b/toyota-avanza.json";
import tierBXenia from "@/data/tier-b/daihatsu-xenia.json";
import tierBBrio from "@/data/tier-b/honda-brio.json";
import tierBInnova from "@/data/tier-b/toyota-kijang-innova.json";
import type {
  ChecklistItem,
  ChecklistSection,
  ChecklistTemplate,
  Confidence,
  Severity,
  InputType,
} from "@/lib/types";

const TIER_A_VERSION = 1;

interface TierBSource {
  brand: string;
  model: string;
  title: string;
  deskripsi: string;
  items: Array<{
    id: string;
    label: string;
    cara_cek: string;
    tanda_bahaya: string;
    severity: Severity;
    input_type: InputType;
    wajib_foto: boolean;
    estimasi_biaya_perbaikan: string;
    confidence: Confidence;
    catatan_verifikasi: string;
  }>;
}

const TIER_B_BY_SLUG: Record<string, TierBSource> = {
  "toyota-avanza": tierBAvanza as TierBSource,
  "daihatsu-xenia": tierBXenia as TierBSource,
  "honda-brio": tierBBrio as TierBSource,
  "toyota-kijang-innova": tierBInnova as TierBSource,
};

interface TierARawItem {
  id: string;
  label: string;
  cara_cek: string;
  tanda_bahaya: string;
  severity: Severity;
  input_type: InputType;
  wajib_foto: boolean;
  estimasi_biaya_perbaikan: string;
}

interface TierARawSection {
  severity: Severity;
  title: string;
  deskripsi?: string;
  items: TierARawItem[];
}

interface TierARawTemplate {
  meta: { judul: string; deskripsi: string; disclaimer: string };
  sections: TierARawSection[];
}

const tierA = tierAJson as unknown as TierARawTemplate;

function buildTierASections(): ChecklistSection[] {
  return tierA.sections.map((section) => ({
    severity: section.severity,
    title: section.title,
    deskripsi: section.deskripsi,
    items: section.items.map<ChecklistItem>((item) => ({ ...item, tier: "A" as const })),
  }));
}

function buildTierBSection(slug: string): ChecklistSection | null {
  const source = TIER_B_BY_SLUG[slug];
  if (!source) return null;
  return {
    severity: "minor",
    title: source.title,
    deskripsi: source.deskripsi,
    items: source.items.map<ChecklistItem>((item) => ({ ...item, tier: "B" as const })),
  };
}

/**
 * Membangun template checklist final untuk sebuah kendaraan: Tier A universal
 * (selalu ada) + Tier B model-spesifik (bila tersedia contohnya), sesuai alur
 * "Generate-Once -> Cache -> Serve" pada dokumen rencana. Di produksi, bagian
 * Tier B ini akan diisi oleh pipeline 2-tahap LLM (lihat prompt-generate-checklist-tier-b.md)
 * lalu disimpan sebagai cache; di sini kita pakai contoh statis yang sudah
 * ditinjau manual untuk beberapa model populer.
 */
export function buildTemplateForVehicle(
  brand: string,
  model: string,
  yearRange: string,
  tierBSlug?: string | null
): ChecklistTemplate {
  const sections = buildTierASections();
  const tierBSection = tierBSlug ? buildTierBSection(tierBSlug) : null;
  if (tierBSection) sections.push(tierBSection);

  return {
    template_id: `${brand}-${model}-${yearRange}`.toLowerCase().replace(/\s+/g, "-"),
    brand,
    model,
    year_range: yearRange,
    version: TIER_A_VERSION,
    status: "published",
    meta: tierA.meta,
    sections,
    has_tier_b: Boolean(tierBSection),
  };
}

export function parseTemplateSnapshot(json: string): ChecklistTemplate {
  return JSON.parse(json) as ChecklistTemplate;
}

export function allItemsOf(template: ChecklistTemplate): ChecklistItem[] {
  return template.sections.flatMap((s) => s.items);
}
