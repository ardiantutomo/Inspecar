import type { ReactNode } from "react";
import type { Result } from "@/lib/checklist/answers";
import type { Weight } from "@/lib/scoring/score";

/**
 * Warna hanya dipakai untuk mengkodekan tingkat temuan — tidak untuk menghias
 * (docs/prompt-desain-ui-anti-slop.md).
 */

export const RESULT_TEXT: Record<Result, string> = {
  aman: "text-clear",
  perhatian: "text-caution",
  bahaya: "text-critical",
  tidak_dicek: "text-ink-soft",
};

export const RESULT_BORDER: Record<Result, string> = {
  aman: "border-clear",
  perhatian: "border-caution",
  bahaya: "border-critical",
  tidak_dicek: "border-line-strong",
};

export const WEIGHT_TEXT: Record<Weight, string> = {
  kritis: "text-critical",
  perhatian: "text-caution",
  ringan: "text-ink-soft",
};

export const WEIGHT_LABEL: Record<Weight, string> = {
  kritis: "Berat",
  perhatian: "Perlu perhatian",
  ringan: "Ringan",
};

/** Rail 3px di sisi kiri, pengganti badge berwarna. */
export function Rail({
  tone,
  children,
  className = "",
}: {
  tone: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-l-[3px] ${tone} pl-3 ${className}`}>{children}</div>
  );
}

export function SeverityWord({
  severity,
}: {
  severity: "major" | "minor" | "addon";
}) {
  const label =
    severity === "major" ? "Penting" : severity === "minor" ? "Sekunder" : "Tambahan";
  return <span className="micro-label">{label}</span>;
}

export function BetaTag() {
  return (
    <span className="micro-label border border-line-strong px-1.5 py-0.5 text-ink-soft">
      Beta · belum terverifikasi
    </span>
  );
}

/** Angka besar + label, dipakai untuk ringkasan jumlah temuan. */
export function Tally({
  value,
  label,
  tone = "text-ink",
}: {
  value: number;
  label: string;
  tone?: string;
}) {
  return (
    <div className="border-l-[3px] border-line pl-3">
      <div className={`data-num text-2xl leading-none ${tone}`}>{value}</div>
      <div className="micro-label mt-1.5 block">{label}</div>
    </div>
  );
}
