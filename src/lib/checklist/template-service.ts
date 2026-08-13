import tierAJson from "@/data/checklist-tier-a-universal.json";
import { prisma } from "@/lib/db";
import { isLlmConfigured } from "@/lib/env";
import {
  type ChecklistTemplateDoc,
  checklistTemplateSchema,
} from "@/lib/checklist/schema";
import { generateTierBSection, tierAItemsOf } from "@/lib/llm/tier-b";

/**
 * Generate-once → cache → serve (docs/prd.md §4).
 *
 * Template tidak pernah dibuat ulang saat user membuka checklist: sekali dibuat,
 * versinya disimpan dan disajikan apa adanya ke semua user. Inspeksi menyimpan
 * `templateKey` + `templateVersion` supaya report lama selalu bisa direproduksi.
 */

let tierACache: ChecklistTemplateDoc | null = null;

export function tierATemplate(): ChecklistTemplateDoc {
  if (!tierACache) {
    tierACache = checklistTemplateSchema.parse(tierAJson);
  }
  return tierACache;
}

export function templateKeyOf(brand: string, model: string, yearRange: string): string {
  return [brand, model, yearRange]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ResolveInput = {
  brand: string;
  model: string;
  yearRange: string;
  variant?: string | null;
};

export type ResolvedTemplate = {
  key: string;
  version: number;
  doc: ChecklistTemplateDoc;
  tierBStatus: string;
  tierBError: string | null;
};

function buildBaseDoc(input: ResolveInput, key: string): ChecklistTemplateDoc {
  const tierA = tierATemplate();
  return {
    ...structuredClone(tierA),
    template_id: key,
    brand: input.brand,
    model: input.model,
    year_range: input.yearRange,
    version: 1,
    tier: "A",
    status: "published",
    meta: {
      ...tierA.meta,
      judul: `Checklist ${input.brand} ${input.model} ${input.yearRange}`,
    },
  };
}

export async function resolveTemplate(input: ResolveInput): Promise<ResolvedTemplate> {
  const key = templateKeyOf(input.brand, input.model, input.yearRange);

  const cached = await prisma.checklistTemplate.findFirst({
    where: { templateKey: key, status: "published" },
    orderBy: { version: "desc" },
  });

  if (cached) {
    return {
      key,
      version: cached.version,
      doc: checklistTemplateSchema.parse(JSON.parse(cached.payload)),
      tierBStatus: cached.tierBStatus,
      tierBError: cached.tierBError,
    };
  }

  const doc = buildBaseDoc(input, key);
  let tierBStatus = isLlmConfigured() ? "pending" : "skipped";
  let tierBError: string | null = null;

  if (isLlmConfigured()) {
    const outcome = await generateTierBSection({
      brand: input.brand,
      model: input.model,
      yearRange: input.yearRange,
      variant: input.variant,
      tierAItems: tierAItemsOf(doc),
    });

    if (outcome.status === "done") {
      // Section Tier B ditempel di atas checklist universal supaya penyakit khas
      // model terlihat lebih dulu, tetap dengan label beta.
      doc.sections = [outcome.section, ...doc.sections];
      doc.tier = "AB";
      tierBStatus = "done";
    } else {
      tierBStatus = outcome.status;
      tierBError = outcome.reason;
    }
  }

  try {
    const created = await prisma.checklistTemplate.create({
      data: {
        templateKey: key,
        brand: input.brand,
        model: input.model,
        yearRange: input.yearRange,
        version: 1,
        tier: doc.tier,
        status: "published",
        payload: JSON.stringify(doc),
        tierBStatus,
        tierBError,
      },
    });

    await prisma.templateAudit.create({
      data: {
        templateKey: key,
        version: 1,
        action: "dibuat",
        detail: `Template dibuat dari Tier A universal. Tier B: ${tierBStatus}${
          tierBError ? ` (${tierBError})` : ""
        }.`,
      },
    });

    return {
      key,
      version: created.version,
      doc,
      tierBStatus: created.tierBStatus,
      tierBError: created.tierBError,
    };
  } catch {
    // Dua request paralel untuk model yang sama: pakai yang sudah tersimpan.
    const existing = await prisma.checklistTemplate.findFirst({
      where: { templateKey: key, status: "published" },
      orderBy: { version: "desc" },
    });
    if (!existing) throw new Error("Gagal menyimpan template checklist");
    return {
      key,
      version: existing.version,
      doc: checklistTemplateSchema.parse(JSON.parse(existing.payload)),
      tierBStatus: existing.tierBStatus,
      tierBError: existing.tierBError,
    };
  }
}

export async function getTemplateVersion(
  key: string,
  version: number,
): Promise<ChecklistTemplateDoc | null> {
  const row = await prisma.checklistTemplate.findUnique({
    where: { templateKey_version: { templateKey: key, version } },
  });
  if (!row) return null;
  return checklistTemplateSchema.parse(JSON.parse(row.payload));
}

/**
 * Menyimpan versi baru dari sebuah template. Dipakai oleh algoritma demote
 * (docs/prd.md §6.2): status item hanya diturunkan, versi selalu naik, dan
 * versi lama tidak pernah diubah supaya report lama tetap sama.
 */
export async function publishNewVersion(
  key: string,
  doc: ChecklistTemplateDoc,
  audit: { action: string; detail: string; actor?: string },
): Promise<number> {
  const latest = await prisma.checklistTemplate.findFirst({
    where: { templateKey: key },
    orderBy: { version: "desc" },
  });
  if (!latest) throw new Error(`Template ${key} tidak ditemukan`);

  const version = latest.version + 1;
  const nextDoc: ChecklistTemplateDoc = { ...doc, version };

  await prisma.$transaction([
    prisma.checklistTemplate.update({
      where: { id: latest.id },
      data: { status: "archived" },
    }),
    prisma.checklistTemplate.create({
      data: {
        templateKey: key,
        brand: latest.brand,
        model: latest.model,
        yearRange: latest.yearRange,
        version,
        tier: nextDoc.tier,
        status: "published",
        payload: JSON.stringify(nextDoc),
        tierBStatus: latest.tierBStatus,
        tierBError: latest.tierBError,
      },
    }),
    prisma.templateAudit.create({
      data: {
        templateKey: key,
        version,
        action: audit.action,
        detail: audit.detail,
        actor: audit.actor ?? "system",
      },
    }),
  ]);

  return version;
}
