import { chat } from "@/lib/llm/client";
import { isLlmConfigured } from "@/lib/env";
import { formatRentang } from "@/lib/scoring/rupiah";
import { type Score, VERDICT_LABEL } from "@/lib/scoring/score";

/**
 * Narasi rekomendasi (docs/prd.md §6.5). LLM hanya menerima hasil checklist yang
 * sudah terstruktur — tidak pernah teks bebas user, dan tidak pernah menentukan
 * verdict. Tanpa API key, narasi disusun dari aturan; isinya setara.
 */

export type NarrativeInput = {
  kendaraan: string;
  score: Score;
  hargaDiminta?: number | null;
  odometerKm?: number | null;
};

const SYSTEM = `Kamu menulis ringkasan hasil inspeksi mobil bekas untuk pembeli awam di Indonesia.

Aturan keras:
- Kamu HANYA boleh memakai fakta dari data JSON yang diberikan. Jangan menambah
  temuan, angka, penyebab, atau nama komponen yang tidak ada di data.
- Verdict sudah ditentukan sistem. Jangan mengubahnya, jangan menawar ulang.
- Tulis Bahasa Indonesia, sentence case, tanpa bahasa jualan, tanpa emoji,
  tanpa basa-basi, tanpa menyebut dirimu AI.
- 3 paragraf pendek: (1) kondisi keseluruhan, (2) yang paling perlu ditindak dan
  konsekuensi biayanya, (3) langkah konkret berikutnya untuk si pembeli.
- Maksimal 160 kata. Jangan pakai heading, daftar, atau tanda kutip.`;

function jumlahTemuan(score: Score): string {
  const bagian: string[] = [];
  if (score.counts.kritis > 0) bagian.push(`${score.counts.kritis} masalah berat`);
  if (score.counts.perhatian > 0) bagian.push(`${score.counts.perhatian} perlu perhatian`);
  if (score.counts.ringan > 0) bagian.push(`${score.counts.ringan} temuan ringan`);
  return bagian.length > 0 ? bagian.join(", ") : "tidak ada temuan";
}

export function ruleNarrative(input: NarrativeInput): string {
  const { score } = input;
  const paragraf: string[] = [];

  const biaya =
    score.biaya.max > 0
      ? `Perkiraan biaya untuk membereskan temuan yang terukur: ${formatRentang(
          score.biaya.min,
          score.biaya.max,
          score.biaya.unbounded,
        )}.`
      : "Tidak ada temuan dengan biaya perbaikan yang bisa diperkirakan angkanya.";

  paragraf.push(
    `Dari ${score.kelengkapan.dijawab} pemeriksaan yang kamu isi pada ${input.kendaraan}, hasilnya: ${jumlahTemuan(
      score,
    )}. ${score.alasan[0] ?? ""}`.trim(),
  );

  if (score.dealBreakers.length > 0) {
    paragraf.push(
      `Yang paling menentukan: ${score.dealBreakers
        .map((finding) => finding.label.toLowerCase())
        .join(", ")}. Temuan seperti ini tidak bisa ditawar dengan harga — risikonya menyangkut legalitas atau keselamatan, jadi lebih baik cari unit lain. ${biaya}`,
    );
  } else if (score.findings.length > 0) {
    const utama = score.findings.slice(0, 3);
    paragraf.push(
      `Yang perlu ditindak lebih dulu: ${utama
        .map((finding) => finding.label.toLowerCase())
        .join(", ")}. ${biaya}${
        score.biaya.takTerukur > 0
          ? ` Ada ${score.biaya.takTerukur} temuan yang biayanya belum bisa diperkirakan sebelum dibongkar bengkel.`
          : ""
      }`,
    );
  } else {
    paragraf.push(
      `Tidak ada temuan yang perlu ditindak dari checklist ini. ${biaya}`,
    );
  }

  const langkah: string[] = [];
  if (score.verdict === "hindari") {
    langkah.push("Batalkan atau minta penjual menyelesaikan masalahnya lebih dulu.");
  } else if (score.verdict === "hati_hati") {
    langkah.push(
      "Bawa mobil ini ke bengkel yang kamu percaya untuk diperiksa sebelum bayar.",
    );
  } else if (score.verdict === "belum_lengkap") {
    langkah.push("Lengkapi pemeriksaan penting yang belum terisi.");
  } else {
    langkah.push("Lanjutkan ke pengecekan dokumen di Samsat dan sepakati harga.");
  }

  if (score.nego.length > 0) {
    langkah.push(
      `Pakai ${score.nego.length} temuan bernilai biaya sebagai dasar menawar, bukan sekadar menawar angka.`,
    );
  }
  if (input.hargaDiminta && score.biaya.max > 0) {
    langkah.push(
      `Harga yang diminta ${formatRentang(input.hargaDiminta, input.hargaDiminta)} belum menghitung biaya di atas.`,
    );
  }
  if (score.fotoKurang.length > 0) {
    langkah.push(
      `${score.fotoKurang.length} pemeriksaan yang seharusnya berfoto masih kosong — fotonya berguna saat minta pendapat orang lain.`,
    );
  }

  paragraf.push(langkah.join(" "));

  return paragraf.join("\n\n");
}

export async function buildNarrative(
  input: NarrativeInput,
): Promise<{ narrative: string; engine: "llm" | "aturan" }> {
  const fallback = { narrative: ruleNarrative(input), engine: "aturan" as const };
  if (!isLlmConfigured()) return fallback;

  const structured = {
    kendaraan: input.kendaraan,
    verdict: VERDICT_LABEL[input.score.verdict],
    alasan: input.score.alasan,
    jumlah: input.score.counts,
    kelengkapan: input.score.kelengkapan,
    harga_diminta: input.hargaDiminta ?? null,
    odometer_km: input.odometerKm ?? null,
    estimasi_biaya: {
      min: input.score.biaya.min,
      max: input.score.biaya.max,
      perkiraan_atas_terbuka: input.score.biaya.unbounded,
      tak_terukur: input.score.biaya.takTerukur,
    },
    temuan: input.score.findings.map((finding) => ({
      label: finding.label,
      bagian: finding.sectionTitle,
      tingkat: finding.weight,
      severity: finding.severity,
      deal_breaker: finding.dealBreaker,
      beta: finding.beta,
      biaya_teks: finding.biaya.teks,
    })),
  };

  try {
    const content = await chat(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(structured) },
      ],
      { temperature: 0.2, maxTokens: 600, timeoutMs: 30_000 },
    );
    const cleaned = content.trim();
    if (cleaned.length < 60) return fallback;
    return { narrative: cleaned, engine: "llm" };
  } catch {
    return fallback;
  }
}
