import {
  ChecklistItem,
  ChecklistTemplate,
  ItemAnswer,
  Verdict,
  VerdictResult,
} from "@/types/checklist";

function isProblematicAnswer(item: ChecklistItem, answer: ItemAnswer | undefined): boolean {
  if (!answer || answer.value === null || answer.value === "") return false;

  switch (item.input_type) {
    case "boolean":
      return answer.value === false;
    case "scale":
      const num = Number(answer.value);
      return !Number.isNaN(num) && num <= 2;
    case "text":
      const text = String(answer.value).toLowerCase();
      return (
        text.includes("blokir") ||
        text.includes("mati") ||
        text.includes("tunggak") ||
        text.includes("tidak cocok") ||
        text.includes("deal-breaker")
      );
    default:
      return false;
  }
}

function isUnanswered(item: ChecklistItem, answer: ItemAnswer | undefined): boolean {
  if (!answer) return true;
  if (answer.value === null || answer.value === "") return true;
  if (item.wajib_foto && !answer.photoDataUrl) return true;
  return false;
}

export function calculateVerdict(
  template: ChecklistTemplate,
  answers: ItemAnswer[]
): VerdictResult {
  const answerMap = new Map(answers.map((a) => [a.itemId, a]));
  const majorIssues: string[] = [];
  const minorIssues: string[] = [];
  const unansweredMajor: string[] = [];

  for (const section of template.sections) {
    for (const item of section.items) {
      const answer = answerMap.get(item.id);

      if (item.severity === "major" && isUnanswered(item, answer)) {
        unansweredMajor.push(item.label);
        continue;
      }

      if (isProblematicAnswer(item, answer)) {
        if (item.severity === "major") {
          majorIssues.push(item.label);
        } else {
          minorIssues.push(item.label);
        }
      }
    }
  }

  const dealBreakerLabels = [
    "nomor rangka cocok",
    "nomor mesin cocok",
    "bpkb asli",
    "bekas las/potong",
  ];

  const hasDealBreaker = majorIssues.some((label) =>
    dealBreakerLabels.some((d) => label.toLowerCase().includes(d.split(" ")[0]))
  );

  let verdict: Verdict;
  let title: string;
  let summary: string;

  if (hasDealBreaker || majorIssues.length >= 3) {
    verdict = "no-go";
    title = "Tidak disarankan lanjut";
    summary =
      "Ditemukan masalah berat atau dokumen bermasalah. Lebih aman cari unit lain atau pastikan pemeriksaan bengkel sebelum memutuskan.";
  } else if (majorIssues.length > 0 || unansweredMajor.length > 2) {
    verdict = "caution";
    title = "Lanjut dengan hati-hati";
    summary =
      "Ada temuan yang perlu dicek lebih lanjut. Gunakan poin temuan untuk negosiasi harga dan pertimbangkan inspeksi bengkel.";
  } else if (minorIssues.length > 0) {
    verdict = "caution";
    title = "Secara umum layak, ada poin nego";
    summary =
      "Tidak ada masalah berat utama, tapi ada beberapa hal minor yang bisa jadi bahan negosiasi harga.";
  } else {
    verdict = "go";
    title = "Kondisi dasar terlihat baik";
    summary =
      "Checklist dasar tidak menunjukkan masalah berat. Tetap lakukan test drive dan pertimbangkan pemeriksaan bengkel untuk keputusan final.";
  }

  return {
    verdict,
    title,
    summary,
    majorIssues,
    minorIssues,
    unansweredMajor,
  };
}

export function getVerdictStyles(verdict: Verdict) {
  switch (verdict) {
    case "go":
      return {
        bg: "bg-clear/10",
        border: "border-clear",
        text: "text-clear",
        badge: "AMAN UNTUK LANJUT",
      };
    case "caution":
      return {
        bg: "bg-caution/10",
        border: "border-caution",
        text: "text-caution",
        badge: "HATI-HATI",
      };
    case "no-go":
      return {
        bg: "bg-critical/10",
        border: "border-critical",
        text: "text-critical",
        badge: "TIDAK DISARANKAN",
      };
  }
}
