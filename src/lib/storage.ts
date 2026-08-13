import type { Inspection } from "@/lib/types";

const KEY = "cekmobil.inspections.v1";

function readAll(): Inspection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Inspection[];
  } catch {
    return [];
  }
}

function writeAll(list: Inspection[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listInspections(): Inspection[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getInspection(id: string): Inspection | null {
  return readAll().find((i) => i.id === id) ?? null;
}

export function saveInspection(inspection: Inspection): void {
  const all = readAll();
  const idx = all.findIndex((i) => i.id === inspection.id);
  const next = { ...inspection, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  writeAll(all);
}

export function deleteInspection(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export async function publishShare(inspection: Inspection): Promise<string> {
  const res = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inspection),
  });
  if (!res.ok) {
    throw new Error("Gagal membuat tautan berbagi");
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}
