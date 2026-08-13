import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Answer, Vehicle } from '../types'

/**
 * Share link report (prd.md §9 Keputusan 6) tanpa backend:
 * payload dikompres lz-string dan ditaruh di fragment URL.
 * Foto TIDAK ikut (terlalu besar) — penerima melihat hasil & catatan.
 */

export interface SharePayload {
  v: 1
  vehicle: Vehicle
  createdAt: number
  tierBId?: string
  /** itemId -> [kondisi, catatan?] */
  a: Record<string, [Answer['kondisi'], string?]>
}

export function encodeShare(payload: SharePayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const parsed = JSON.parse(json) as SharePayload
    if (parsed.v !== 1 || !parsed.vehicle || !parsed.a) return null
    return parsed
  } catch {
    return null
  }
}

export function buildShareUrl(payload: SharePayload): string {
  return `${location.origin}${import.meta.env.BASE_URL}#/laporan/${encodeShare(payload)}`
}
