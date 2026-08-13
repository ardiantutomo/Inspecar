import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MicroLabel, Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { allVisibleItems } from "@/lib/checklist/schema";
import { getTemplateVersion } from "@/lib/checklist/template-service";
import { prisma } from "@/lib/db";
import { formatInspectionCode, formatTanggal } from "@/lib/report";

export const metadata: Metadata = { title: "Inspeksi saya" };

export default async function DaftarInspeksi() {
  const user = await requireUser("/inspeksi");

  const inspections = await prisma.inspection.findMany({
    where: { userId: user.id },
    include: { vehicle: true, _count: { select: { answers: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const totalCache = new Map<string, number>();
  const rows = await Promise.all(
    inspections.map(async (inspection) => {
      const cacheKey = `${inspection.templateKey}@${inspection.templateVersion}:${
        inspection.vehicle.transmission ?? "-"
      }`;
      let total = totalCache.get(cacheKey);
      if (total === undefined) {
        const doc = await getTemplateVersion(
          inspection.templateKey,
          inspection.templateVersion,
        );
        total = doc ? allVisibleItems(doc, inspection.vehicle.transmission).length : 0;
        totalCache.set(cacheKey, total);
      }
      return { inspection, total };
    }),
  );

  return (
    <Page width="wide">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Riwayat"
          title="Inspeksi saya"
          lead="Inspeksi yang belum selesai bisa dilanjutkan kapan saja."
        />
        <ButtonLink href="/inspeksi/baru" size="lg">
          Inspeksi baru
        </ButtonLink>
      </div>

      {rows.length === 0 ? (
        <Sheet className="p-6">
          <h2 className="text-lg font-semibold">Belum ada inspeksi</h2>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            Mulai dari memilih mobil yang mau kamu lihat. Kamu bisa mengisi
            checklist sambil berdiri di dekat mobilnya — jawaban tersimpan otomatis.
          </p>
          <ButtonLink href="/inspeksi/baru" className="mt-5">
            Pilih mobil
          </ButtonLink>
        </Sheet>
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ inspection, total }) => {
            const dijawab = inspection._count.answers;
            const persen = total === 0 ? 0 : Math.min(100, Math.round((dijawab / total) * 100));
            const selesai = inspection.status === "selesai";

            return (
              <Sheet as="li" key={inspection.id} className="p-4">
                <Link
                  href={selesai ? `/inspeksi/${inspection.id}/hasil` : `/inspeksi/${inspection.id}`}
                  className="group block"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-lg font-semibold underline-offset-4 group-hover:underline">
                      {inspection.vehicle.brand} {inspection.vehicle.model}
                    </h2>
                    <MicroLabel>
                      {selesai ? "Selesai" : "Berjalan"} ·{" "}
                      {formatInspectionCode(inspection.id)}
                    </MicroLabel>
                  </div>

                  <p className="data-num mt-1 text-sm text-ink-soft">
                    {inspection.vehicle.yearRange}
                    {inspection.vehicle.transmission
                      ? ` · ${inspection.vehicle.transmission}`
                      : ""}
                    {inspection.vehicle.plateNo ? ` · ${inspection.vehicle.plateNo}` : ""}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className="h-[3px] w-full max-w-56 bg-line"
                      role="presentation"
                    >
                      <div
                        className="h-[3px] bg-brand"
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                    <span className="data-num text-xs text-ink-soft">
                      {dijawab}/{total}
                    </span>
                  </div>

                  <p className="micro-label mt-3 block">
                    {inspection.paidAt ? "Report lengkap aktif · " : ""}
                    {formatTanggal(inspection.updatedAt)}
                  </p>
                </Link>
              </Sheet>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
