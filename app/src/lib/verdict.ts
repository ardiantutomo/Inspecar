import type {
  Answer,
  ChecklistItem,
  ChecklistTemplate,
  VerdictResult,
} from '../types'
import { allItems, isDealBreaker } from './template'

/**
 * Mesin rekomendasi deterministik — sesuai prd.md §6.5:
 * rekomendasi dihitung dari hasil checklist TERSTRUKTUR (bukan teks bebas),
 * sehingga konsisten dan bisa direproduksi.
 */
export function computeVerdict(
  template: ChecklistTemplate,
  answers: Record<string, Answer>,
): VerdictResult {
  const items = allItems(template)
  const majors = items.filter((i) => i.severity === 'major')

  const dealBreakers: ChecklistItem[] = []
  const majorMasalah: ChecklistItem[] = []
  const majorRagu: ChecklistItem[] = []
  const negoPoints: VerdictResult['negoPoints'] = []

  let answeredMajor = 0
  let answeredTotal = 0

  for (const item of items) {
    const kondisi = answers[item.id]?.kondisi
    if (kondisi) answeredTotal++
    if (item.severity === 'major') {
      if (kondisi) answeredMajor++
      if (kondisi === 'masalah') {
        if (isDealBreaker(item)) dealBreakers.push(item)
        else majorMasalah.push(item)
      } else if (kondisi === 'ragu') {
        majorRagu.push(item)
      }
    } else {
      if (kondisi === 'masalah' || kondisi === 'ragu') {
        negoPoints.push({ item, kondisi })
      }
    }
  }

  let level: VerdictResult['level']
  let headline: string
  const reasons: string[] = []

  if (dealBreakers.length > 0) {
    level = 'no-go'
    headline = 'Sebaiknya batalkan'
    reasons.push(
      `Ditemukan ${dealBreakers.length} temuan fatal: ${dealBreakers
        .map((i) => i.label.toLowerCase())
        .join('; ')}. Masalah seperti ini berisiko hukum atau keamanan — bukan sekadar biaya perbaikan.`,
    )
  } else if (majorMasalah.length >= 2) {
    level = 'no-go'
    headline = 'Sebaiknya cari unit lain'
    reasons.push(
      `Ada ${majorMasalah.length} masalah serius sekaligus (${majorMasalah
        .map((i) => i.label.toLowerCase())
        .join('; ')}). Total biaya & risikonya sulit diprediksi.`,
    )
  } else if (majorMasalah.length === 1 || majorRagu.length >= 3) {
    level = 'hati-hati'
    headline = 'Lanjut hanya dengan syarat'
    if (majorMasalah.length === 1) {
      reasons.push(
        `Ada 1 masalah serius: ${majorMasalah[0].label.toLowerCase()} (estimasi: ${majorMasalah[0].estimasi_biaya_perbaikan}). Minta pemeriksaan bengkel terpercaya sebelum bayar, dan jadikan bahan nego.`,
      )
    }
    if (majorRagu.length >= 3) {
      reasons.push(
        `${majorRagu.length} pemeriksaan penting hasilnya masih ragu. Jangan bayar sebelum semua dipastikan (bawa montir bila perlu).`,
      )
    }
  } else {
    level = 'go'
    headline = 'Tidak ada temuan serius'
    reasons.push(
      'Semua pemeriksaan utama yang diisi hasilnya aman. Tetap lakukan pemeriksaan bengkel bila nilai transaksi besar.',
    )
    if (majorRagu.length > 0) {
      reasons.push(
        `Masih ada ${majorRagu.length} item penting berstatus ragu — pastikan dulu sebelum bayar.`,
      )
    }
  }

  if (negoPoints.length > 0) {
    reasons.push(
      `${negoPoints.length} temuan ringan bisa dipakai sebagai bahan negosiasi harga.`,
    )
  }

  if (answeredMajor < majors.length) {
    reasons.push(
      `Catatan: baru ${answeredMajor} dari ${majors.length} pemeriksaan utama yang diisi — rekomendasi ini belum final.`,
    )
  }

  return {
    level,
    headline,
    reasons,
    dealBreakers,
    majorMasalah,
    majorRagu,
    negoPoints,
    answeredMajor,
    totalMajor: majors.length,
    answeredTotal,
    totalItems: items.length,
  }
}
