import type { Result } from "@/lib/checklist/answers";
import {
  allVisibleItems,
  type ChecklistItem,
  type ChecklistTemplateDoc,
  visibleItems,
} from "@/lib/checklist/schema";
import { type Biaya, parseBiaya } from "@/lib/scoring/rupiah";

/**
 * Penilaian sepenuhnya deterministik: dari jawaban terstruktur ke putusan.
 * LLM tidak pernah ikut menentukan verdict — hanya menyusun narasinya
 * (docs/prd.md §6.5), supaya report bisa direproduksi & tidak berubah-ubah.
 */

export type Weight = "kritis" | "perhatian" | "ringan";

export type AnswerInput = {
  itemId: string;
  result: Result;
  detail?: string | null;
  photoCount?: number;
};

export type Finding = {
  itemId: string;
  label: string;
  sectionTitle: string;
  severity: ChecklistItem["severity"];
  result: Result;
  weight: Weight;
  dealBreaker: boolean;
  tanda_bahaya: string;
  beta: boolean;
  biaya: Biaya;
  /** Porsi biaya yang dihitung untuk item ini (perhatian = separuh rentang). */
  biayaMin: number;
  biayaMax: number;
};

export type Verdict = "layak" | "hati_hati" | "hindari" | "belum_lengkap";

export type Score = {
  verdict: Verdict;
  alasan: string[];
  counts: {
    kritis: number;
    perhatian: number;
    ringan: number;
    aman: number;
    tidakDicek: number;
  };
  kelengkapan: {
    total: number;
    dijawab: number;
    persen: number;
    majorTotal: number;
    majorDijawab: number;
    majorBelumDicek: number;
  };
  findings: Finding[];
  dealBreakers: Finding[];
  /** Temuan ringan/menengah yang wajar dipakai menawar harga. */
  nego: Finding[];
  biaya: {
    min: number;
    max: number;
    unbounded: boolean;
    takTerukur: number;
  };
  fotoKurang: string[];
};

function weightOf(item: ChecklistItem, result: Result): Weight | null {
  if (result === "bahaya") {
    return item.severity === "major" ? "kritis" : "perhatian";
  }
  if (result === "perhatian") {
    return item.severity === "major" ? "perhatian" : "ringan";
  }
  return null;
}

export function computeScore(
  template: ChecklistTemplateDoc,
  answers: AnswerInput[],
  options: { transmission?: string | null } = {},
): Score {
  const answerMap = new Map(answers.map((answer) => [answer.itemId, answer]));

  const findings: Finding[] = [];
  const fotoKurang: string[] = [];
  const counts = { kritis: 0, perhatian: 0, ringan: 0, aman: 0, tidakDicek: 0 };

  let majorTotal = 0;
  let majorDijawab = 0;
  let majorBelumDicek = 0;
  let biayaMin = 0;
  let biayaMax = 0;
  let unbounded = false;
  let takTerukur = 0;

  const items = allVisibleItems(template, options.transmission);

  for (const section of template.sections) {
    for (const item of visibleItems(section, options.transmission)) {
      const answer = answerMap.get(item.id);
      const isMajor = item.severity === "major";
      if (isMajor) majorTotal += 1;

      if (!answer) continue;
      if (isMajor) majorDijawab += 1;

      if (answer.result === "aman") counts.aman += 1;
      if (answer.result === "tidak_dicek") {
        counts.tidakDicek += 1;
        if (isMajor) majorBelumDicek += 1;
      }

      if (
        (item.wajib_foto || item.input_type === "photo") &&
        answer.result !== "tidak_dicek" &&
        !answer.photoCount
      ) {
        fotoKurang.push(item.label);
      }

      const weight = weightOf(item, answer.result);
      if (!weight) continue;

      counts[weight] += 1;

      const biaya = parseBiaya(item.estimasi_biaya_perbaikan);
      const share = answer.result === "perhatian" ? 0.5 : 1;
      const itemMin = biaya.kind === "angka" ? Math.round(biaya.min * share) : 0;
      const itemMax = biaya.kind === "angka" ? Math.round(biaya.max * share) : 0;

      if (biaya.kind === "angka") {
        biayaMin += itemMin;
        biayaMax += itemMax;
        if (biaya.unbounded) unbounded = true;
      } else {
        takTerukur += 1;
      }

      findings.push({
        itemId: item.id,
        label: item.label,
        sectionTitle: section.title,
        severity: item.severity,
        result: answer.result,
        weight,
        dealBreaker: Boolean(item.deal_breaker) && answer.result === "bahaya",
        tanda_bahaya: item.tanda_bahaya,
        beta: item.tier === "B",
        biaya,
        biayaMin: itemMin,
        biayaMax: itemMax,
      });
    }
  }

  const order: Record<Weight, number> = { kritis: 0, perhatian: 1, ringan: 2 };
  findings.sort((a, b) => {
    if (a.dealBreaker !== b.dealBreaker) return a.dealBreaker ? -1 : 1;
    if (order[a.weight] !== order[b.weight]) return order[a.weight] - order[b.weight];
    return b.biayaMax - a.biayaMax;
  });

  const dealBreakers = findings.filter((finding) => finding.dealBreaker);
  const nego = findings
    .filter((finding) => !finding.dealBreaker && finding.biaya.kind === "angka")
    .sort((a, b) => b.biayaMax - a.biayaMax);

  const dijawab = answers.filter((answer) =>
    items.some((item) => item.id === answer.itemId),
  ).length;

  const alasan: string[] = [];
  let verdict: Verdict;

  if (majorDijawab < majorTotal) {
    verdict = "belum_lengkap";
    alasan.push(
      `${majorTotal - majorDijawab} pemeriksaan penting belum diisi, jadi belum bisa disimpulkan.`,
    );
  } else if (dealBreakers.length > 0) {
    verdict = "hindari";
    alasan.push(
      `Ada ${dealBreakers.length} temuan yang membatalkan pembelian: ${dealBreakers
        .map((finding) => finding.label.toLowerCase())
        .join(", ")}.`,
    );
  } else if (counts.kritis >= 3) {
    verdict = "hindari";
    alasan.push(
      `${counts.kritis} masalah berat sekaligus. Biaya perbaikannya menumpuk dan risikonya tidak sepadan.`,
    );
  } else if (counts.kritis >= 1) {
    verdict = "hati_hati";
    alasan.push(
      `${counts.kritis} masalah berat ditemukan. Perlu diperiksa bengkel sebelum kamu bayar.`,
    );
  } else if (counts.perhatian >= 4) {
    verdict = "hati_hati";
    alasan.push(
      `${counts.perhatian} hal perlu perhatian. Tidak ada yang berat, tapi jumlahnya banyak.`,
    );
  } else {
    verdict = "layak";
    alasan.push("Tidak ada masalah berat pada pemeriksaan penting.");
  }

  if (verdict === "layak" && majorBelumDicek >= 2) {
    verdict = "hati_hati";
    alasan.push(
      `${majorBelumDicek} pemeriksaan penting belum bisa dicek, jadi kesimpulan "layak" belum bisa dipegang.`,
    );
  } else if (majorBelumDicek > 0) {
    alasan.push(
      `${majorBelumDicek} pemeriksaan penting berstatus belum bisa dicek — lengkapi saat kunjungan berikutnya.`,
    );
  }

  if (verdict !== "belum_lengkap" && nego.length > 0) {
    alasan.push(
      `${nego.length} temuan bisa dipakai sebagai bahan menawar harga.`,
    );
  }

  return {
    verdict,
    alasan,
    counts,
    kelengkapan: {
      total: items.length,
      dijawab,
      persen: items.length === 0 ? 0 : Math.round((dijawab / items.length) * 100),
      majorTotal,
      majorDijawab,
      majorBelumDicek,
    },
    findings,
    dealBreakers,
    nego,
    biaya: { min: biayaMin, max: biayaMax, unbounded, takTerukur },
    fotoKurang,
  };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  layak: "Layak dibeli",
  hati_hati: "Hati-hati",
  hindari: "Sebaiknya batal",
  belum_lengkap: "Belum lengkap",
};

export const VERDICT_RINGKAS: Record<Verdict, string> = {
  layak: "Kondisi sesuai harapan untuk mobil bekas seusia ini.",
  hati_hati: "Ada temuan yang harus dibereskan atau dinegosiasi dulu.",
  hindari: "Temuan pada mobil ini terlalu berisiko untuk dilanjutkan.",
  belum_lengkap: "Pemeriksaan penting belum semua terisi.",
};
