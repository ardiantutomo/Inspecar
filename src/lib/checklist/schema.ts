import { z } from "zod";

/**
 * Kontrak schema JSON checklist (docs/prd.md §5).
 *
 * Tiga field tambahan di luar dokumen rencana, dipakai agar penilaian bisa
 * deterministik tanpa LLM:
 * - `polaritas`   : untuk item boolean, menandai jawaban mana yang berarti aman.
 *                   Tanpa ini "Nomor rangka cocok" dan "Bekas las pada rangka"
 *                   tidak bisa dinilai dengan aturan yang sama.
 * - `deal_breaker`: item yang bila bermasalah langsung membatalkan rekomendasi.
 * - `berlaku_transmisi`: item yang hanya relevan untuk matic atau manual.
 *
 * Field Tier B (`confidence`, `catatan_verifikasi`) mengikuti
 * docs/prompt-generate-checklist-tier-b.md §1.
 */

export const ITEM_SEVERITIES = ["major", "minor", "addon"] as const;
export const INPUT_TYPES = ["boolean", "scale", "text", "photo"] as const;
export const ITEM_STATUSES = ["active", "optional", "hidden"] as const;
export const POLARITIES = ["ya_aman", "ya_bahaya"] as const;
export const TIERS = ["A", "B"] as const;

export type ItemSeverity = (typeof ITEM_SEVERITIES)[number];
export type InputType = (typeof INPUT_TYPES)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const checklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  cara_cek: z.string().min(1),
  tanda_bahaya: z.string().min(1),
  severity: z.enum(ITEM_SEVERITIES),
  input_type: z.enum(INPUT_TYPES),
  wajib_foto: z.boolean().default(false),
  estimasi_biaya_perbaikan: z.string().default("Tidak terukur"),
  status: z.enum(ITEM_STATUSES).default("active"),
  polaritas: z.enum(POLARITIES).optional(),
  deal_breaker: z.boolean().optional(),
  berlaku_transmisi: z.enum(["matic", "manual"]).optional(),
  label_detail: z.string().optional(),
  tier: z.enum(TIERS).default("A"),
  confidence: z.enum(["high", "medium"]).optional(),
  catatan_verifikasi: z.string().optional(),
});

export const checklistSectionSchema = z.object({
  severity: z.enum(["major", "minor", "addon", "optional"]),
  title: z.string().min(1),
  deskripsi: z.string().optional(),
  tier: z.enum(TIERS).default("A"),
  beta: z.boolean().default(false),
  items: z.array(checklistItemSchema).min(1),
});

export const checklistTemplateSchema = z.object({
  template_id: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year_range: z.string().min(1),
  version: z.number().int().positive(),
  tier: z.enum(["A", "B", "AB"]),
  status: z.enum(["published", "beta", "archived"]),
  meta: z.object({
    judul: z.string(),
    deskripsi: z.string(),
    disclaimer: z.string(),
  }),
  sections: z.array(checklistSectionSchema).min(1),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type ChecklistSection = z.infer<typeof checklistSectionSchema>;
export type ChecklistTemplateDoc = z.infer<typeof checklistTemplateSchema>;

/** Output Tier B dari LLM (2 pass) sebelum ditempel ke template. */
export const tierBResponseSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  year_range: z.string().optional(),
  tier: z.literal("B").optional(),
  items: z.array(
    checklistItemSchema
      .omit({ tier: true, status: true })
      .extend({
        status: z.literal("beta").optional(),
        confidence: z.enum(["high", "medium"]),
        catatan_verifikasi: z.string().min(1),
      }),
  ),
});

export type TierBResponse = z.infer<typeof tierBResponseSchema>;

export function sectionKey(section: ChecklistSection, index: number): string {
  return `${index}-${section.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

/** Item yang ditampilkan ke user: hidden disembunyikan, matic/manual difilter. */
export function visibleItems(
  section: ChecklistSection,
  transmission?: string | null,
): ChecklistItem[] {
  return section.items.filter((item) => {
    if (item.status === "hidden") return false;
    if (item.berlaku_transmisi && transmission && item.berlaku_transmisi !== transmission) {
      return false;
    }
    return true;
  });
}

export function allVisibleItems(
  template: ChecklistTemplateDoc,
  transmission?: string | null,
): ChecklistItem[] {
  return template.sections.flatMap((section) => visibleItems(section, transmission));
}
