import type { Inspection } from '../types'

const KEY = 'periksamobil.inspections.v1'

function readAll(): Inspection[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Inspection[]) : []
  } catch {
    return []
  }
}

function writeAll(list: Inspection[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function listInspections(): Inspection[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getInspection(id: string): Inspection | undefined {
  return readAll().find((i) => i.id === id)
}

export function saveInspection(inspection: Inspection) {
  const list = readAll()
  const idx = list.findIndex((i) => i.id === inspection.id)
  const next = { ...inspection, updatedAt: Date.now() }
  if (idx >= 0) list[idx] = next
  else list.push(next)
  try {
    writeAll(list)
  } catch {
    // localStorage penuh (biasanya karena foto) — simpan tanpa foto agar data inti aman
    const stripped = list.map((i) =>
      i.id === inspection.id
        ? {
            ...next,
            answers: Object.fromEntries(
              Object.entries(next.answers).map(([k, v]) => [k, { ...v, foto: undefined }]),
            ),
          }
        : i,
    )
    writeAll(stripped)
  }
}

export function deleteInspection(id: string) {
  writeAll(readAll().filter((i) => i.id !== id))
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36)
}
