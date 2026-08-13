import type { Metadata } from "next";
import { JalankanDemote } from "@/app/kurasi/jalankan-demote";
import { MicroLabel, Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { requireAdmin } from "@/lib/auth";
import { getTemplateVersion } from "@/lib/checklist/template-service";
import { prisma } from "@/lib/db";
import { AMBANG, evaluateDemotions } from "@/lib/feedback";
import { formatTanggal } from "@/lib/report";

export const metadata: Metadata = { title: "Kurasi checklist" };

export default async function KurasiPage() {
  await requireAdmin();

  const [signals, suggestions, audits, templates] = await Promise.all([
    prisma.itemFeedback.findMany({
      orderBy: [{ impressions: "desc" }],
      take: 80,
    }),
    prisma.itemSuggestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.templateAudit.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.checklistTemplate.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ]);

  const usulan = await evaluateDemotions({ dryRun: true });

  const labelCache = new Map<string, string>();
  for (const template of templates) {
    const doc = await getTemplateVersion(template.templateKey, template.version);
    if (!doc) continue;
    for (const section of doc.sections) {
      for (const item of section.items) {
        labelCache.set(`${template.templateKey}:${item.id}`, `${item.label} (${item.status})`);
      }
    }
  }

  return (
    <Page width="wide">
      <PageHeading
        eyebrow="Internal"
        title="Kurasi checklist"
        lead={`Item hanya diturunkan statusnya, tidak pernah dihapus otomatis. Ambang: ≥${AMBANG.minImpressions} tampilan, ≥${Math.round(
          AMBANG.optionalRate * 100,
        )}% ditandai → optional; ≥${Math.round(
          AMBANG.hiddenRate * 100,
        )}% dengan ≥${AMBANG.hiddenMinImpressions} tampilan → hidden.`}
      />

      <Sheet className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <MicroLabel>Usulan demote</MicroLabel>
            <p className="mt-1 text-sm text-ink-soft">
              {usulan.length === 0
                ? "Belum ada item yang melewati ambang."
                : `${usulan.length} item melewati ambang dan siap diturunkan.`}
            </p>
          </div>
          {usulan.length > 0 && <JalankanDemote jumlah={usulan.length} />}
        </div>

        {usulan.length > 0 && (
          <ul className="mt-4">
            {usulan.map((change) => (
              <li
                key={`${change.templateKey}-${change.itemId}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-2 last:border-b-0"
              >
                <span className="text-sm">
                  {change.label}
                  <span className="micro-label ml-2">{change.templateKey}</span>
                </span>
                <span className="data-num text-sm text-caution">
                  {change.from} → {change.to} ·{" "}
                  {Math.round(change.rate * 100)}% ({change.flagIrrelevant}/
                  {change.impressions})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Sheet>

      <h2 className="mt-8 text-lg font-semibold">Sinyal relevansi</h2>
      {signals.length === 0 ? (
        <Sheet className="mt-3 p-4">
          <p className="text-sm text-ink-soft">
            Belum ada data. Sinyal terkumpul saat pengguna membuka bagian checklist
            dan menandai item yang tidak relevan.
          </p>
        </Sheet>
      ) : (
        <Sheet className="mt-3 overflow-x-auto p-4">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="pb-2 pr-4 font-normal">
                  <MicroLabel>Item</MicroLabel>
                </th>
                <th className="pb-2 pr-4 font-normal">
                  <MicroLabel>Template</MicroLabel>
                </th>
                <th className="pb-2 pr-4 text-right font-normal">
                  <MicroLabel>Tampil</MicroLabel>
                </th>
                <th className="pb-2 pr-4 text-right font-normal">
                  <MicroLabel>Ditandai</MicroLabel>
                </th>
                <th className="pb-2 text-right font-normal">
                  <MicroLabel>Rasio</MicroLabel>
                </th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal) => {
                const rate = signal.impressions
                  ? signal.flagIrrelevant / signal.impressions
                  : 0;
                return (
                  <tr key={signal.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-4">
                      {labelCache.get(`${signal.templateKey}:${signal.itemId}`) ??
                        signal.itemId}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="data-num text-xs text-ink-soft">
                        {signal.templateKey} v{signal.version}
                      </span>
                    </td>
                    <td className="data-num py-2 pr-4 text-right">
                      {signal.impressions}
                    </td>
                    <td className="data-num py-2 pr-4 text-right">
                      {signal.flagIrrelevant}
                    </td>
                    <td
                      className={`data-num py-2 text-right ${
                        rate >= AMBANG.hiddenRate
                          ? "text-critical"
                          : rate >= AMBANG.optionalRate
                            ? "text-caution"
                            : ""
                      }`}
                    >
                      {Math.round(rate * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Sheet>
      )}

      <h2 className="mt-8 text-lg font-semibold">Usulan pemeriksaan baru</h2>
      {suggestions.length === 0 ? (
        <Sheet className="mt-3 p-4">
          <p className="text-sm text-ink-soft">Belum ada usulan masuk.</p>
        </Sheet>
      ) : (
        <ul className="mt-3 grid gap-2">
          {suggestions.map((suggestion) => (
            <Sheet as="li" key={suggestion.id} className="p-4">
              <p className="text-sm">{suggestion.text}</p>
              <MicroLabel className="mt-2 block">
                {suggestion.templateKey} v{suggestion.version} ·{" "}
                {formatTanggal(suggestion.createdAt)}
              </MicroLabel>
            </Sheet>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold">Jejak perubahan template</h2>
      {audits.length === 0 ? (
        <Sheet className="mt-3 p-4">
          <p className="text-sm text-ink-soft">Belum ada perubahan tercatat.</p>
        </Sheet>
      ) : (
        <Sheet className="mt-3 p-4">
          <ul>
            {audits.map((audit) => (
              <li key={audit.id} className="border-b border-line py-2 last:border-b-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="text-sm font-medium">{audit.action}</span>
                  <span className="data-num text-xs text-ink-soft">
                    {audit.templateKey} v{audit.version} ·{" "}
                    {formatTanggal(audit.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{audit.detail}</p>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </Page>
  );
}
