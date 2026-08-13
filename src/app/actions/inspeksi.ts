"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isResult } from "@/lib/checklist/answers";
import { sectionKey as makeSectionKey, visibleItems } from "@/lib/checklist/schema";
import {
  getTemplateVersion,
  resolveTemplate,
} from "@/lib/checklist/template-service";
import { prisma } from "@/lib/db";
import { recordImpressions, setFlagIrrelevant } from "@/lib/feedback";
import { deletePhoto } from "@/lib/photos";

async function ambilInspeksi(inspectionId: string) {
  const user = await requireUser();
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { vehicle: true },
  });
  if (!inspection || inspection.userId !== user.id) {
    throw new Error("Inspeksi tidak ditemukan");
  }
  return { user, inspection };
}

const baruSchema = z.object({
  brand: z.string().trim().min(1, "Merk belum dipilih"),
  model: z.string().trim().min(1, "Model belum dipilih"),
  yearRange: z.string().trim().min(1, "Tahun belum dipilih"),
  year: z.coerce.number().int().min(1980).max(2100).optional(),
  transmission: z.enum(["matic", "manual"]).optional(),
  variant: z.string().trim().max(60).optional(),
  plateNo: z.string().trim().max(15).optional(),
  odometerKm: z.coerce.number().int().min(0).max(2_000_000).optional(),
  askingPrice: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
});

export type BaruState = { error?: string };

function bersih(value: FormDataEntryValue | null): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : undefined;
}

export async function mulaiInspeksiAction(
  _prev: BaruState,
  formData: FormData,
): Promise<BaruState> {
  const user = await requireUser("/inspeksi/baru");

  const parsed = baruSchema.safeParse({
    brand: bersih(formData.get("brand")),
    model: bersih(formData.get("model")),
    yearRange: bersih(formData.get("yearRange")),
    year: bersih(formData.get("year")),
    transmission: bersih(formData.get("transmission")),
    variant: bersih(formData.get("variant")),
    plateNo: bersih(formData.get("plateNo")),
    odometerKm: bersih(formData.get("odometerKm")),
    askingPrice: bersih(formData.get("askingPrice")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data kendaraan belum lengkap" };
  }

  const data = parsed.data;

  let template;
  try {
    template = await resolveTemplate({
      brand: data.brand,
      model: data.model,
      yearRange: data.yearRange,
      variant: data.variant,
    });
  } catch {
    return {
      error: "Checklist untuk mobil ini gagal disiapkan. Coba lagi sebentar lagi.",
    };
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId: user.id,
      brand: data.brand,
      model: data.model,
      yearRange: data.yearRange,
      year: data.year,
      variant: data.variant,
      transmission: data.transmission,
      plateNo: data.plateNo,
    },
  });

  const inspection = await prisma.inspection.create({
    data: {
      userId: user.id,
      vehicleId: vehicle.id,
      templateKey: template.key,
      templateVersion: template.version,
      odometerKm: data.odometerKm,
      askingPrice: data.askingPrice,
    },
  });

  redirect(`/inspeksi/${inspection.id}`);
}

const jawabanSchema = z.object({
  inspectionId: z.string().min(1),
  itemId: z.string().min(1),
  sectionKey: z.string().min(1),
  result: z.string().refine(isResult, "Hasil tidak dikenal"),
  detail: z.string().max(500).nullable().optional(),
});

export async function simpanJawabanAction(input: {
  inspectionId: string;
  itemId: string;
  sectionKey: string;
  result: string;
  detail?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = jawabanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Jawaban tidak valid" };

  const { inspection } = await ambilInspeksi(parsed.data.inspectionId);
  if (inspection.status === "selesai") {
    return { ok: false, error: "Inspeksi sudah ditutup" };
  }

  const detail = parsed.data.detail?.trim() || null;

  await prisma.answer.upsert({
    where: {
      inspectionId_itemId: {
        inspectionId: inspection.id,
        itemId: parsed.data.itemId,
      },
    },
    create: {
      inspectionId: inspection.id,
      itemId: parsed.data.itemId,
      sectionKey: parsed.data.sectionKey,
      result: parsed.data.result,
      detail,
    },
    update: { result: parsed.data.result, detail },
  });

  // Angka odometer yang dicatat di checklist juga dipakai di header report.
  if (parsed.data.itemId === "odo_kewajaran" && detail) {
    const km = Number.parseInt(detail.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(km) && km > 0 && km < 2_000_000) {
      await prisma.inspection.update({
        where: { id: inspection.id },
        data: { odometerKm: km },
      });
    }
  }

  return { ok: true };
}

export async function tandaiTidakRelevanAction(input: {
  inspectionId: string;
  itemId: string;
  flagged: boolean;
}): Promise<{ ok: boolean }> {
  const { inspection } = await ambilInspeksi(input.inspectionId);

  const answer = await prisma.answer.findUnique({
    where: {
      inspectionId_itemId: { inspectionId: inspection.id, itemId: input.itemId },
    },
  });

  if (answer?.flagIrrelevant === input.flagged) return { ok: true };

  await prisma.answer.upsert({
    where: {
      inspectionId_itemId: { inspectionId: inspection.id, itemId: input.itemId },
    },
    create: {
      inspectionId: inspection.id,
      itemId: input.itemId,
      sectionKey: "",
      result: "tidak_dicek",
      flagIrrelevant: input.flagged,
    },
    update: { flagIrrelevant: input.flagged },
  });

  await setFlagIrrelevant(
    inspection.templateKey,
    inspection.templateVersion,
    input.itemId,
    input.flagged,
  );

  return { ok: true };
}

/**
 * Impressions dihitung sekali per inspeksi per section (PRD §6.1), dipanggil
 * dari klien saat section dibuka.
 */
export async function catatImpresiAction(input: {
  inspectionId: string;
  sectionKey: string;
}): Promise<{ ok: boolean }> {
  const { inspection } = await ambilInspeksi(input.inspectionId);

  const seen = inspection.seenSections.split(",").filter(Boolean);
  if (seen.includes(input.sectionKey)) return { ok: true };

  const template = await getTemplateVersion(
    inspection.templateKey,
    inspection.templateVersion,
  );
  if (!template) return { ok: false };

  const section = template.sections.find(
    (entry, index) => makeSectionKey(entry, index) === input.sectionKey,
  );
  if (!section) return { ok: false };

  await recordImpressions(
    inspection.templateKey,
    inspection.templateVersion,
    visibleItems(section, inspection.vehicle.transmission).map((item) => item.id),
  );

  await prisma.inspection.update({
    where: { id: inspection.id },
    data: { seenSections: [...seen, input.sectionKey].join(",") },
  });

  return { ok: true };
}

export async function usulItemAction(
  _prev: { pesan?: string; error?: string },
  formData: FormData,
): Promise<{ pesan?: string; error?: string }> {
  const { user, inspection } = await ambilInspeksi(
    String(formData.get("inspectionId") ?? ""),
  );

  const text = String(formData.get("text") ?? "").trim();
  if (text.length < 6) {
    return { error: "Tulis sedikit lebih jelas apa yang perlu ditambahkan." };
  }

  await prisma.itemSuggestion.create({
    data: {
      templateKey: inspection.templateKey,
      version: inspection.templateVersion,
      text: text.slice(0, 400),
      userId: user.id,
    },
  });

  return { pesan: "Usulanmu tercatat. Terima kasih." };
}

export async function perbaruiDetailInspeksiAction(
  _prev: { error?: string; pesan?: string },
  formData: FormData,
): Promise<{ error?: string; pesan?: string }> {
  const { inspection } = await ambilInspeksi(
    String(formData.get("inspectionId") ?? ""),
  );

  const km = bersih(formData.get("odometerKm"));
  const harga = bersih(formData.get("askingPrice"));
  const catatan = bersih(formData.get("sellerNote"));

  const parsedKm = km ? Number.parseInt(km.replace(/[^\d]/g, ""), 10) : null;
  const parsedHarga = harga ? Number.parseInt(harga.replace(/[^\d]/g, ""), 10) : null;

  await prisma.inspection.update({
    where: { id: inspection.id },
    data: {
      odometerKm: Number.isFinite(parsedKm as number) ? parsedKm : null,
      askingPrice: Number.isFinite(parsedHarga as number) ? parsedHarga : null,
      sellerNote: catatan?.slice(0, 500) ?? null,
    },
  });

  revalidatePath(`/inspeksi/${inspection.id}`);
  return { pesan: "Tersimpan." };
}

export async function hapusFotoAction(input: {
  inspectionId: string;
  photoId: string;
}): Promise<{ ok: boolean }> {
  const { inspection } = await ambilInspeksi(input.inspectionId);
  await deletePhoto(input.photoId, inspection.id);
  return { ok: true };
}

export async function selesaikanInspeksiAction(formData: FormData): Promise<void> {
  const { inspection } = await ambilInspeksi(
    String(formData.get("inspectionId") ?? ""),
  );

  if (inspection.status !== "selesai") {
    await prisma.inspection.update({
      where: { id: inspection.id },
      data: { status: "selesai", completedAt: new Date() },
    });
  }

  redirect(`/inspeksi/${inspection.id}/hasil`);
}

export async function bukaKembaliInspeksiAction(formData: FormData): Promise<void> {
  const { inspection } = await ambilInspeksi(
    String(formData.get("inspectionId") ?? ""),
  );

  await prisma.inspection.update({
    where: { id: inspection.id },
    data: { status: "draft", completedAt: null },
  });
  // Narasi lama dibuang supaya report tidak mencampur hasil sebelum & sesudah.
  await prisma.reportSummary.deleteMany({ where: { inspectionId: inspection.id } });

  redirect(`/inspeksi/${inspection.id}`);
}

export async function hapusInspeksiAction(formData: FormData): Promise<void> {
  const { inspection } = await ambilInspeksi(
    String(formData.get("inspectionId") ?? ""),
  );
  await prisma.inspection.delete({ where: { id: inspection.id } });
  redirect("/inspeksi");
}
