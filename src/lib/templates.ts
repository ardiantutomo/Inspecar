import tierARaw from "@/data/checklist-tier-a-universal.json";
import { findCatalogEntry } from "@/data/catalog";
import { getTierBItems } from "@/data/tier-b-samples";
import type { ChecklistSection, ChecklistTemplate } from "@/lib/types";

const tierA = tierARaw as ChecklistTemplate;

export function buildTemplate(
  brand: string,
  model: string,
  year_range: string,
): ChecklistTemplate {
  const entry = findCatalogEntry(brand, model, year_range);
  const key = entry?.id ?? `${brand}-${model}-${year_range}`.toLowerCase().replace(/\s+/g, "-");
  const tierBItems = getTierBItems(key);

  const sections: ChecklistSection[] = tierA.sections.map((s) => ({
    ...s,
    tier: "A",
  }));

  if (tierBItems.length > 0) {
    sections.unshift({
      severity: "major",
      title: `Penyakit khas ${model} (Beta)`,
      deskripsi:
        "Isu spesifik model ini belum terverifikasi penuh. Anggap sebagai petunjuk tambahan, bukan fakta pasti.",
      tier: "B",
      items: tierBItems,
    });
  }

  return {
    template_id: key,
    brand,
    model,
    year_range,
    version: tierA.version + (tierBItems.length > 0 ? 1 : 0),
    tier: tierBItems.length > 0 ? "B" : "A",
    status: "published",
    meta: tierA.meta,
    sections,
  };
}

export function getDisclaimer(): string {
  return (
    tierA.meta?.disclaimer ??
    "Hasil checklist ini adalah alat bantu keputusan, bukan jaminan kondisi kendaraan."
  );
}
