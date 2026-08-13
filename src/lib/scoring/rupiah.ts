/**
 * Membaca string `estimasi_biaya_perbaikan` dari template (ditulis untuk manusia,
 * mis. "Rp 500rb - 3jt") menjadi angka supaya total biaya bisa dihitung.
 *
 * Kalau string-nya bukan rentang angka (mis. "Deal-breaker (batalkan)" atau
 * "Sangat mahal / tak terprediksi"), item tetap dilaporkan tapi tidak dijumlahkan.
 * Report harus menyebutkan jumlah item semacam itu, bukan menyembunyikannya.
 */

export type BiayaKind = "angka" | "deal_breaker" | "tak_terukur";

export type Biaya = {
  kind: BiayaKind;
  min: number;
  max: number;
  /** Batas atas hanya perkiraan ("puluhan juta") — tampilkan dengan "+". */
  unbounded: boolean;
  /** Teks asli dari template, selalu ditampilkan apa adanya ke user. */
  teks: string;
};

const PHRASES: Array<{ re: RegExp; value: number; unbounded?: boolean }> = [
  { re: /ratusan\s+ribu/, value: 300_000 },
  { re: /beberapa\s+ratus\s+ribu/, value: 300_000 },
  { re: /belasan\s+juta/, value: 12_000_000 },
  { re: /puluhan\s+juta/, value: 20_000_000, unbounded: true },
  { re: /ratusan\s+juta/, value: 100_000_000, unbounded: true },
  { re: /beberapa\s+juta/, value: 3_000_000 },
];

function parseAmount(raw: string): { value: number; unbounded: boolean } | null {
  const text = raw.toLowerCase();

  for (const phrase of PHRASES) {
    if (phrase.re.test(text)) {
      return { value: phrase.value, unbounded: phrase.unbounded ?? false };
    }
  }

  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta|k|m)?/);
  if (!match) return null;

  const number = Number.parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(number)) return null;

  const unit = match[2];
  const multiplier =
    unit === "rb" || unit === "ribu" || unit === "k"
      ? 1_000
      : unit === "jt" || unit === "juta" || unit === "m"
        ? 1_000_000
        : 1;

  return { value: Math.round(number * multiplier), unbounded: false };
}

export function parseBiaya(teks: string): Biaya {
  const text = teks.toLowerCase();
  const base: Biaya = { kind: "tak_terukur", min: 0, max: 0, unbounded: false, teks };

  if (/deal-?breaker|batalkan|berisiko keamanan|berisiko tinggi/.test(text)) {
    return { ...base, kind: "deal_breaker" };
  }

  const sides = text.split(/\s*-\s*/);
  const first = parseAmount(sides[0] ?? "");
  const second = sides.length > 1 ? parseAmount(sides[1] ?? "") : null;

  if (!first && !second) return base;

  const min = first?.value ?? 0;
  const max = second?.value ?? first?.value ?? 0;
  const unbounded = Boolean(first?.unbounded || second?.unbounded);

  if (max === 0 && min === 0) return base;

  return {
    kind: "angka",
    min: Math.min(min, max),
    max: Math.max(min, max),
    unbounded,
    teks,
  };
}

export function formatRupiah(value: number): string {
  if (value <= 0) return "Rp 0";
  if (value < 1_000_000) {
    const ribu = Math.round(value / 1_000);
    return `Rp ${ribu}rb`;
  }
  const juta = value / 1_000_000;
  const rounded = juta < 10 ? Math.round(juta * 10) / 10 : Math.round(juta);
  return `Rp ${String(rounded).replace(".", ",")}jt`;
}

export function formatRentang(
  min: number,
  max: number,
  unbounded = false,
): string {
  if (min === 0 && max === 0) return "—";
  const suffix = unbounded ? "+" : "";
  if (min === max) return `${formatRupiah(min)}${suffix}`;
  return `${formatRupiah(min)} – ${formatRupiah(max)}${suffix}`;
}

export function formatKm(value: number): string {
  return `${value.toLocaleString("id-ID")} km`;
}
