import { getDisclaimer } from "@/lib/templates";
import type {
  AnswerValue,
  ChecklistItem,
  ChecklistTemplate,
  Finding,
  InspectionAnswers,
  InspectionSummary,
  Verdict,
} from "@/lib/types";

function isDealBreaker(item: ChecklistItem): boolean {
  const e = item.estimasi_biaya_perbaikan.toLowerCase();
  return e.includes("batalkan") || e.includes("deal-breaker");
}

function classifyAnswer(
  item: ChecklistItem,
  value: AnswerValue | undefined,
): Finding["level"] {
  if (value === null || value === undefined || value === "") return "unknown";

  if (item.input_type === "boolean") {
    return value === true ? "ok" : "critical";
  }

  if (item.input_type === "scale" && typeof value === "number") {
    if (value <= 2) return item.severity === "major" ? "critical" : "caution";
    if (value === 3) return "caution";
    return "ok";
  }

  if (item.input_type === "text" && typeof value === "string") {
    const lower = value.toLowerCase();
    if (
      lower.includes("blokir") ||
      lower.includes("tidak cocok") ||
      lower.includes("bermasalah") ||
      lower.includes("diputar")
    ) {
      return "critical";
    }
    if (value.trim().length > 0) return "ok";
  }

  return "unknown";
}

export function summarizeInspection(
  template: ChecklistTemplate,
  answers: InspectionAnswers,
): InspectionSummary {
  const findings: Finding[] = [];

  for (const section of template.sections) {
    for (const item of section.items) {
      if (item.status === "hidden") continue;
      const answer = answers[item.id];
      const level = classifyAnswer(item, answer?.value);
      findings.push({
        itemId: item.id,
        label: item.label,
        sectionTitle: section.title,
        severity: item.severity,
        tier: section.tier ?? template.tier,
        level,
        detail:
          level === "critical" || level === "caution"
            ? item.tanda_bahaya
            : item.cara_cek,
        estimasi: item.estimasi_biaya_perbaikan,
        isDealBreaker: isDealBreaker(item) && level === "critical",
      });
    }
  }

  const critical = findings.filter((f) => f.level === "critical");
  const caution = findings.filter((f) => f.level === "caution");
  const ok = findings.filter((f) => f.level === "ok");
  const unanswered = findings.filter((f) => f.level === "unknown");
  const dealBreakers = critical.filter((f) => f.isDealBreaker);
  const majorCritical = critical.filter((f) => f.severity === "major");

  let verdict: Verdict = "go";
  if (dealBreakers.length > 0 || majorCritical.length >= 3) {
    verdict = "no-go";
  } else if (majorCritical.length >= 1 || caution.length >= 3) {
    verdict = "hati-hati";
  }

  // Skor dihitung dari item yang sudah diisi (belum diisi tidak menghukum skor).
  const answeredFindings = findings.filter((f) => f.level !== "unknown");
  const answered = answeredFindings.length;
  let score = 100;
  if (answered === 0) {
    score = 0;
  } else {
    const okWeight = ok.length;
    const cautionWeight = caution.length * 0.55;
    const criticalWeight = critical.length * 0.15;
    const quality =
      (okWeight + cautionWeight + criticalWeight) / answered;
    const severityPenalty =
      majorCritical.length * 12 +
      critical.filter((f) => f.severity !== "major").length * 6 +
      caution.length * 3;
    score = Math.max(
      0,
      Math.min(100, Math.round(quality * 100 - severityPenalty)),
    );
  }

  const negoPoints = [...critical, ...caution]
    .filter((f) => !f.isDealBreaker)
    .slice(0, 6)
    .map((f) => `${f.label} — bahan nego (estimasi: ${f.estimasi})`);

  return {
    verdict,
    score,
    criticalCount: critical.length,
    cautionCount: caution.length,
    okCount: ok.length,
    unansweredCount: unanswered.length,
    findings,
    negoPoints,
    disclaimer: getDisclaimer(),
  };
}

export function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "go":
      return "Layak dilanjutkan";
    case "hati-hati":
      return "Hati-hati / nego";
    case "no-go":
      return "Sebaiknya batalkan";
  }
}

export function verdictHint(verdict: Verdict): string {
  switch (verdict) {
    case "go":
      return "Tidak ada temuan major yang membatalkan. Tetap verifikasi dokumen & bawa ke bengkel bila ragu.";
    case "hati-hati":
      return "Ada temuan yang perlu ditimbang. Pakai daftar nego di bawah sebelum bayar.";
    case "no-go":
      return "Ada indikasi deal-breaker atau terlalu banyak masalah major. Aman untuk jalan.";
  }
}
