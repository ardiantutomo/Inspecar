import { Inspection } from "@/types/checklist";

const STORAGE_KEY = "cekmobil_inspections";

export function saveInspection(inspection: Inspection): void {
  const all = getAllInspections();
  const idx = all.findIndex((i) => i.id === inspection.id);
  if (idx >= 0) {
    all[idx] = inspection;
  } else {
    all.push(inspection);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getInspection(id: string): Inspection | null {
  const all = getAllInspections();
  return all.find((i) => i.id === id) ?? null;
}

export function getAllInspections(): Inspection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Inspection[]) : [];
  } catch {
    return [];
  }
}

export function generateInspectionId(): string {
  return `ins_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Encode inspection for share URL (strip photos to keep URL small) */
export function encodeInspectionForShare(inspection: Inspection): string {
  const lite = {
    ...inspection,
    answers: inspection.answers.map((a) => ({
      itemId: a.itemId,
      value: a.value,
      flagged: a.flagged,
    })),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(lite))));
}

export function decodeInspectionFromShare(encoded: string): Inspection | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as Inspection;
  } catch {
    return null;
  }
}
