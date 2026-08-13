import type { AnswerMap, ChecklistItem, ChecklistTemplate, Verdict } from "@/lib/types";
import { allItemsOf } from "@/lib/template";

/**
 * Item yang bila ditandai "bermasalah" langsung membatalkan rencana beli,
 * terlepas dari skor lainnya (nomor rangka/mesin tidak cocok = indikasi mobil
 * bodong/curian, sesuai §8 & §9 dokumen rencana).
 */
const DEAL_BREAKER_ITEM_IDS = new Set(["doc_rangka_match", "doc_mesin_match"]);

export interface VerdictResult {
  verdict: Verdict;
  summary: string;
  dealBreakers: ChecklistItem[];
  majorFindings: ChecklistItem[];
  minorFindings: ChecklistItem[];
  addonFindings: ChecklistItem[];
  stats: {
    totalItems: number;
    answeredItems: number;
    majorBermasalah: number;
    minorBermasalah: number;
    addonBermasalah: number;
  };
}

export function computeVerdict(template: ChecklistTemplate, answers: AnswerMap): VerdictResult {
  const items = allItemsOf(template);
  const bermasalah = items.filter((item) => answers[item.id]?.status === "bermasalah");

  const dealBreakers = bermasalah.filter((item) => DEAL_BREAKER_ITEM_IDS.has(item.id));
  const majorFindings = bermasalah.filter((item) => item.severity === "major" && !DEAL_BREAKER_ITEM_IDS.has(item.id));
  const minorFindings = bermasalah.filter((item) => item.severity === "minor");
  const addonFindings = bermasalah.filter((item) => item.severity === "addon");

  const answeredItems = items.filter((item) => Boolean(answers[item.id]?.status)).length;

  let verdict: Verdict;
  if (dealBreakers.length > 0) {
    verdict = "no-go";
  } else if (majorFindings.length >= 3) {
    verdict = "no-go";
  } else if (majorFindings.length >= 1 || minorFindings.length >= 4) {
    verdict = "hati-hati";
  } else {
    verdict = "go";
  }

  const summary = buildSummary(verdict, dealBreakers, majorFindings, minorFindings);

  return {
    verdict,
    summary,
    dealBreakers,
    majorFindings,
    minorFindings,
    addonFindings,
    stats: {
      totalItems: items.length,
      answeredItems,
      majorBermasalah: majorFindings.length,
      minorBermasalah: minorFindings.length,
      addonBermasalah: addonFindings.length,
    },
  };
}

function buildSummary(
  verdict: Verdict,
  dealBreakers: ChecklistItem[],
  majorFindings: ChecklistItem[],
  minorFindings: ChecklistItem[]
): string {
  if (verdict === "no-go") {
    if (dealBreakers.length > 0) {
      return `Ditemukan masalah serius pada dokumen (${dealBreakers
        .map((i) => i.label)
        .join(", ")}). Ini indikasi kuat kendaraan berisiko tinggi secara legal — sebaiknya batalkan, jangan lanjut ke tahap negosiasi.`;
    }
    return `Ditemukan ${majorFindings.length} temuan mayor. Kombinasi temuan ini menandakan risiko besar pada kondisi kendaraan. Pertimbangkan untuk tidak melanjutkan, atau minta pemeriksaan bengkel independen sebelum memutuskan apa pun.`;
  }
  if (verdict === "hati-hati") {
    const parts: string[] = [];
    if (majorFindings.length > 0) parts.push(`${majorFindings.length} temuan mayor`);
    if (minorFindings.length > 0) parts.push(`${minorFindings.length} temuan minor`);
    return `Ditemukan ${parts.join(" dan ")}. Kendaraan masih bisa dipertimbangkan, tapi gunakan temuan ini sebagai bahan negosiasi harga dan minta penjual memperbaiki atau mengompensasi biaya perbaikan sebelum deal.`;
  }
  return "Tidak ditemukan temuan mayor yang mengkhawatirkan dari checklist ini. Kendaraan tergolong layak dipertimbangkan — tetap gunakan penilaianmu sendiri dan pertimbangkan pemeriksaan bengkel independen untuk keputusan akhir.";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  go: "Layak dipertimbangkan",
  "hati-hati": "Hati-hati, ada catatan",
  "no-go": "Sebaiknya jangan lanjut",
};
