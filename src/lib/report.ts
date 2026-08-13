import { prisma } from "@/lib/db";
import { isResult } from "@/lib/checklist/answers";
import type { ChecklistTemplateDoc } from "@/lib/checklist/schema";
import { getTemplateVersion } from "@/lib/checklist/template-service";
import { buildNarrative } from "@/lib/llm/narrative";
import { type AnswerInput, computeScore, type Score } from "@/lib/scoring/score";

export type ReportData = {
  inspection: {
    id: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    odometerKm: number | null;
    askingPrice: number | null;
    sellerNote: string | null;
    shareToken: string | null;
    isPaid: boolean;
    templateKey: string;
    templateVersion: number;
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
  template: ChecklistTemplateDoc;
  score: Score;
  narrative: string;
  narrativeEngine: string;
  photosByItem: Record<string, string[]>;
  answersByItem: Record<string, { result: string; detail: string | null }>;
};

export async function loadReport(inspectionId: string): Promise<ReportData | null> {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { vehicle: true, answers: true, photos: true, report: true },
  });
  if (!inspection) return null;

  const template = await getTemplateVersion(
    inspection.templateKey,
    inspection.templateVersion,
  );
  if (!template) return null;

  const photosByItem: Record<string, string[]> = {};
  for (const photo of inspection.photos) {
    photosByItem[photo.itemId] = [...(photosByItem[photo.itemId] ?? []), photo.id];
  }

  const answers: AnswerInput[] = inspection.answers
    .filter((answer) => isResult(answer.result))
    .map((answer) => ({
      itemId: answer.itemId,
      result: answer.result as AnswerInput["result"],
      detail: answer.detail,
      photoCount: photosByItem[answer.itemId]?.length ?? 0,
    }));

  const score = computeScore(template, answers, {
    transmission: inspection.vehicle.transmission,
  });

  const kendaraan = `${inspection.vehicle.brand} ${inspection.vehicle.model} ${inspection.vehicle.yearRange}`;

  let narrative: string;
  let narrativeEngine: string;

  // Narasi hanya dibekukan untuk inspeksi yang sudah selesai, supaya report yang
  // sudah dibagikan tidak berubah kalimatnya saat dibuka ulang.
  if (inspection.report && inspection.status === "selesai") {
    narrative = inspection.report.narrative;
    narrativeEngine = inspection.report.engine;
  } else {
    const built = await buildNarrative({
      kendaraan,
      score,
      hargaDiminta: inspection.askingPrice,
      odometerKm: inspection.odometerKm,
    });
    narrative = built.narrative;
    narrativeEngine = built.engine;

    if (inspection.status === "selesai") {
      await prisma.reportSummary.upsert({
        where: { inspectionId: inspection.id },
        create: {
          inspectionId: inspection.id,
          verdict: score.verdict,
          scoreJson: JSON.stringify(score),
          narrative,
          engine: built.engine,
        },
        update: {
          verdict: score.verdict,
          scoreJson: JSON.stringify(score),
          narrative,
          engine: built.engine,
        },
      });
    }
  }

  const answersByItem: Record<string, { result: string; detail: string | null }> = {};
  for (const answer of inspection.answers) {
    answersByItem[answer.itemId] = { result: answer.result, detail: answer.detail };
  }

  return {
    inspection: {
      id: inspection.id,
      status: inspection.status,
      startedAt: inspection.startedAt,
      completedAt: inspection.completedAt,
      odometerKm: inspection.odometerKm,
      askingPrice: inspection.askingPrice,
      sellerNote: inspection.sellerNote,
      shareToken: inspection.shareToken,
      isPaid: inspection.paidAt !== null,
      templateKey: inspection.templateKey,
      templateVersion: inspection.templateVersion,
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
    template,
    score,
    narrative,
    narrativeEngine,
    photosByItem,
    answersByItem,
  };
}

export function formatInspectionCode(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
