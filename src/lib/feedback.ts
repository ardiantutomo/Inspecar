import { prisma } from "@/lib/db";
import type { ChecklistTemplateDoc } from "@/lib/checklist/schema";
import { getTemplateVersion, publishNewVersion } from "@/lib/checklist/template-service";

/**
 * Loop feedback relevansi (docs/prd.md §6).
 *
 * Aturan yang tidak boleh dilanggar: otomatis hanya boleh MENURUNKAN status item
 * (active → optional → hidden). Hapus permanen selalu keputusan manusia.
 */

export const AMBANG = {
  minImpressions: 30,
  optionalRate: 0.4,
  hiddenRate: 0.6,
  hiddenMinImpressions: 50,
} as const;

export async function recordImpressions(
  templateKey: string,
  version: number,
  itemIds: string[],
): Promise<void> {
  await Promise.all(
    itemIds.map((itemId) =>
      prisma.itemFeedback.upsert({
        where: { templateKey_version_itemId: { templateKey, version, itemId } },
        create: { templateKey, version, itemId, impressions: 1 },
        update: { impressions: { increment: 1 } },
      }),
    ),
  );
}

export async function setFlagIrrelevant(
  templateKey: string,
  version: number,
  itemId: string,
  flagged: boolean,
): Promise<void> {
  await prisma.itemFeedback.upsert({
    where: { templateKey_version_itemId: { templateKey, version, itemId } },
    create: {
      templateKey,
      version,
      itemId,
      impressions: 1,
      flagIrrelevant: flagged ? 1 : 0,
    },
    update: { flagIrrelevant: { increment: flagged ? 1 : -1 } },
  });
}

export type Demotion = {
  templateKey: string;
  version: number;
  itemId: string;
  label: string;
  from: string;
  to: "optional" | "hidden";
  impressions: number;
  flagIrrelevant: number;
  rate: number;
};

function targetStatus(
  impressions: number,
  flags: number,
): "optional" | "hidden" | null {
  if (impressions < AMBANG.minImpressions) return null;
  const rate = flags / impressions;
  if (rate >= AMBANG.hiddenRate && impressions >= AMBANG.hiddenMinImpressions) {
    return "hidden";
  }
  if (rate >= AMBANG.optionalRate) return "optional";
  return null;
}

const RANK: Record<string, number> = { active: 0, optional: 1, hidden: 2 };

/**
 * Menghitung usulan demote dari sinyal yang terkumpul. `dryRun` dipakai halaman
 * kurasi untuk menampilkan calon perubahan sebelum diterapkan.
 */
export async function evaluateDemotions(
  options: { dryRun?: boolean; actor?: string } = {},
): Promise<Demotion[]> {
  const signals = await prisma.itemFeedback.findMany({
    where: { impressions: { gte: AMBANG.minImpressions } },
  });

  const perKey = new Map<string, typeof signals>();
  for (const signal of signals) {
    const bucket = perKey.get(signal.templateKey) ?? [];
    bucket.push(signal);
    perKey.set(signal.templateKey, bucket);
  }

  const hasil: Demotion[] = [];

  for (const [templateKey, rows] of perKey) {
    const latest = await prisma.checklistTemplate.findFirst({
      where: { templateKey, status: "published" },
      orderBy: { version: "desc" },
    });
    if (!latest) continue;

    const doc = await getTemplateVersion(templateKey, latest.version);
    if (!doc) continue;

    const perubahan: Demotion[] = [];
    const nextDoc: ChecklistTemplateDoc = structuredClone(doc);

    for (const row of rows) {
      if (row.version !== latest.version) continue;
      const target = targetStatus(row.impressions, row.flagIrrelevant);
      if (!target) continue;

      for (const section of nextDoc.sections) {
        const item = section.items.find((entry) => entry.id === row.itemId);
        if (!item) continue;
        if (RANK[target] <= RANK[item.status]) continue;

        perubahan.push({
          templateKey,
          version: latest.version,
          itemId: item.id,
          label: item.label,
          from: item.status,
          to: target,
          impressions: row.impressions,
          flagIrrelevant: row.flagIrrelevant,
          rate: row.flagIrrelevant / row.impressions,
        });
        item.status = target;
      }
    }

    if (perubahan.length === 0) continue;
    hasil.push(...perubahan);

    if (!options.dryRun) {
      await publishNewVersion(templateKey, nextDoc, {
        action: "demote-otomatis",
        actor: options.actor ?? "system",
        detail: perubahan
          .map(
            (change) =>
              `${change.itemId}: ${change.from} → ${change.to} (${change.flagIrrelevant}/${change.impressions} ditandai tidak relevan)`,
          )
          .join("; "),
      });
    }
  }

  return hasil;
}
