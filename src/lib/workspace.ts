import { isResult, type Result } from "@/lib/checklist/answers";
import {
  type ChecklistItem,
  type ChecklistTemplateDoc,
  sectionKey as makeSectionKey,
  visibleItems,
} from "@/lib/checklist/schema";
import { getTemplateVersion } from "@/lib/checklist/template-service";
import { prisma } from "@/lib/db";
import { computeScore, type Score } from "@/lib/scoring/score";

export type AnswerView = {
  result: Result;
  detail: string | null;
  flagIrrelevant: boolean;
};

export type SectionView = {
  key: string;
  index: number;
  title: string;
  deskripsi?: string;
  severity: string;
  beta: boolean;
  items: ChecklistItem[];
  total: number;
  dijawab: number;
  temuan: number;
};

export type Workspace = {
  inspection: {
    id: string;
    status: string;
    templateKey: string;
    templateVersion: number;
    odometerKm: number | null;
    askingPrice: number | null;
    sellerNote: string | null;
    paidAt: Date | null;
    startedAt: Date;
    updatedAt: Date;
  };
  vehicle: {
    brand: string;
    model: string;
    yearRange: string;
    year: number | null;
    variant: string | null;
    transmission: string | null;
    plateNo: string | null;
  };
  vehicleLabel: string;
  template: ChecklistTemplateDoc;
  sections: SectionView[];
  answers: Record<string, AnswerView>;
  photos: Record<string, string[]>;
  score: Score;
};

/** Data yang dipakai bersama oleh halaman ringkasan dan halaman per bagian. */
export async function loadWorkspace(
  inspectionId: string,
  userId: string,
): Promise<Workspace | null> {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { vehicle: true, answers: true, photos: true },
  });
  if (!inspection || inspection.userId !== userId) return null;

  const template = await getTemplateVersion(
    inspection.templateKey,
    inspection.templateVersion,
  );
  if (!template) return null;

  const answers: Record<string, AnswerView> = {};
  for (const answer of inspection.answers) {
    if (!isResult(answer.result)) continue;
    answers[answer.itemId] = {
      result: answer.result,
      detail: answer.detail,
      flagIrrelevant: answer.flagIrrelevant,
    };
  }

  const photos: Record<string, string[]> = {};
  for (const photo of inspection.photos) {
    photos[photo.itemId] = [...(photos[photo.itemId] ?? []), photo.id];
  }

  const transmission = inspection.vehicle.transmission;

  const score = computeScore(
    template,
    Object.entries(answers).map(([itemId, answer]) => ({
      itemId,
      result: answer.result,
      detail: answer.detail,
      photoCount: photos[itemId]?.length ?? 0,
    })),
    { transmission },
  );

  const temuanPerItem = new Set(score.findings.map((finding) => finding.itemId));

  const sections: SectionView[] = template.sections.map((section, index) => {
    const items = visibleItems(section, transmission);
    return {
      key: makeSectionKey(section, index),
      index,
      title: section.title,
      deskripsi: section.deskripsi,
      severity: section.severity,
      beta: section.beta,
      items,
      total: items.length,
      dijawab: items.filter((item) => answers[item.id] !== undefined).length,
      temuan: items.filter((item) => temuanPerItem.has(item.id)).length,
    };
  });

  return {
    inspection: {
      id: inspection.id,
      status: inspection.status,
      templateKey: inspection.templateKey,
      templateVersion: inspection.templateVersion,
      odometerKm: inspection.odometerKm,
      askingPrice: inspection.askingPrice,
      sellerNote: inspection.sellerNote,
      paidAt: inspection.paidAt,
      startedAt: inspection.startedAt,
      updatedAt: inspection.updatedAt,
    },
    vehicle: {
      brand: inspection.vehicle.brand,
      model: inspection.vehicle.model,
      yearRange: inspection.vehicle.yearRange,
      year: inspection.vehicle.year,
      variant: inspection.vehicle.variant,
      transmission: inspection.vehicle.transmission,
      plateNo: inspection.vehicle.plateNo,
    },
    vehicleLabel: `${inspection.vehicle.brand} ${inspection.vehicle.model} ${inspection.vehicle.yearRange}`,
    template,
    sections,
    answers,
    photos,
    score,
  };
}
