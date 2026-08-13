import tierAJson from '../data/checklist-tier-a-universal.json'
import { findTierB } from '../data/tierB'
import type { ChecklistTemplate, ChecklistSection, ChecklistItem, Vehicle } from '../types'

export const TIER_A = tierAJson as unknown as ChecklistTemplate

/**
 * Bangun template final untuk kendaraan: Tier A universal + section Tier B
 * (bila model punya template penyakit khas). Pola generate-once → cache → serve:
 * semua data sudah cached di bundle, tidak ada panggilan LLM live.
 */
export function buildTemplate(vehicle: Vehicle): {
  template: ChecklistTemplate
  tierBId?: string
} {
  const tierB = findTierB(vehicle.model, vehicle.yearRange)
  const sections: ChecklistSection[] = [
    ...TIER_A.sections.map((s) => ({ ...s, tier: 'A' as const })),
  ]
  if (tierB) {
    sections.push(tierB.section)
  }
  return {
    template: { ...TIER_A, sections },
    tierBId: tierB?.id,
  }
}

export function allItems(template: ChecklistTemplate): ChecklistItem[] {
  return template.sections.flatMap((s) => s.items)
}

/** Item yang dianggap deal-breaker bila bermasalah (dokumen palsu, rangka dilas, dll) */
export function isDealBreaker(item: ChecklistItem): boolean {
  return /batal|deal-breaker/i.test(item.estimasi_biaya_perbaikan)
}
