import type { ChecklistItem } from "@/lib/checklist/schema";

export const RESULTS = ["aman", "perhatian", "bahaya", "tidak_dicek"] as const;
export type Result = (typeof RESULTS)[number];

export function isResult(value: unknown): value is Result {
  return typeof value === "string" && (RESULTS as readonly string[]).includes(value);
}

export type ResultOption = {
  value: Result;
  label: string;
};

/**
 * Pilihan jawaban dibentuk dari kalimat itemnya, bukan dari istilah sistem.
 * Untuk item boolean, `polaritas` menentukan jawaban mana yang berarti aman.
 */
export function resultOptions(item: ChecklistItem): ResultOption[] {
  if (item.input_type === "boolean") {
    if (item.polaritas === "ya_bahaya") {
      return [
        { value: "aman", label: "Tidak ada tandanya" },
        { value: "bahaya", label: "Ada tandanya" },
        { value: "tidak_dicek", label: "Belum bisa dicek" },
      ];
    }
    return [
      { value: "aman", label: "Ya, sesuai" },
      { value: "bahaya", label: "Tidak sesuai" },
      { value: "tidak_dicek", label: "Belum bisa dicek" },
    ];
  }

  return [
    { value: "aman", label: "Baik" },
    { value: "perhatian", label: "Perlu perhatian" },
    { value: "bahaya", label: "Bermasalah" },
    { value: "tidak_dicek", label: "Belum bisa dicek" },
  ];
}

export const RESULT_LABEL: Record<Result, string> = {
  aman: "Aman",
  perhatian: "Perlu perhatian",
  bahaya: "Bermasalah",
  tidak_dicek: "Belum dicek",
};

export function needsDetail(item: ChecklistItem): boolean {
  return item.input_type === "text";
}

export function needsPhoto(item: ChecklistItem): boolean {
  return item.wajib_foto || item.input_type === "photo";
}
