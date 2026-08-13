import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { selesaikanInspeksiAction } from "@/app/actions/inspeksi";
import { DetailKendaraan } from "@/app/inspeksi/[id]/detail-kendaraan";
import { UsulItem } from "@/app/inspeksi/[id]/usul-item";
import { Button, ButtonLink } from "@/components/ui/button";
import { DataRow, MicroLabel, Page, Sheet } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { formatInspectionCode } from "@/lib/report";
import { formatKm, formatRupiah } from "@/lib/scoring/rupiah";
import { loadWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Ringkasan inspeksi" };

export default async function RingkasanInspeksi({
  params,
}: PageProps<"/inspeksi/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/inspeksi/${id}`);
  const ws = await loadWorkspace(id, user.id);
  if (!ws) notFound();

  const totalItem = ws.sections.reduce((total, section) => total + section.total, 0);
  const totalDijawab = ws.sections.reduce((total, section) => total + section.dijawab, 0);
  const persen = totalItem === 0 ? 0 : Math.round((totalDijawab / totalItem) * 100);
  const majorBelum = ws.score.kelengkapan.majorTotal - ws.score.kelengkapan.majorDijawab;
  const lanjut = ws.sections.find((section) => section.dijawab < section.total);

  return (
    <Page width="narrow" className="pb-28">
      <div className="mb-6">
        <MicroLabel>
          Inspeksi {formatInspectionCode(ws.inspection.id)} · checklist v
          {ws.inspection.templateVersion}
        </MicroLabel>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {ws.vehicle.brand} {ws.vehicle.model}
        </h1>
        <p className="data-num mt-1 text-ink-soft">
          {ws.vehicle.yearRange}
          {ws.vehicle.year ? ` · unit ${ws.vehicle.year}` : ""}
          {ws.vehicle.transmission ? ` · ${ws.vehicle.transmission}` : ""}
        </p>
      </div>

      <Sheet className="p-4">
        <div className="flex items-baseline justify-between gap-4">
          <MicroLabel>Kelengkapan</MicroLabel>
          <span className="data-num text-sm">
            {totalDijawab}/{totalItem} · {persen}%
          </span>
        </div>
        <div className="mt-3 h-[3px] w-full bg-line" role="presentation">
          <div className="h-[3px] bg-brand" style={{ width: `${persen}%` }} />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {majorBelum > 0
            ? `${majorBelum} pemeriksaan penting belum diisi. Putusan baru bisa dihitung setelah semuanya terisi.`
            : "Semua pemeriksaan penting sudah terisi. Kamu bisa menyelesaikan inspeksi kapan saja."}
        </p>
      </Sheet>

      <h2 className="mt-8 text-lg font-semibold">Bagian pemeriksaan</h2>
      <ol className="mt-3 grid gap-2">
        {ws.sections.map((section) => {
          const lengkap = section.dijawab === section.total;
          return (
            <Sheet as="li" key={section.key} className="p-0">
              <Link
                href={`/inspeksi/${ws.inspection.id}/bagian/${section.key}`}
                className="group flex items-start gap-4 p-4"
              >
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    lengkap ? "bg-clear" : section.dijawab > 0 ? "bg-caution" : "bg-line-strong"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-display text-[17px] font-semibold underline-offset-4 group-hover:underline">
                      {section.title}
                    </span>
                    <span className="data-num text-xs text-ink-soft">
                      {section.dijawab}/{section.total}
                    </span>
                  </span>
                  <span className="micro-label mt-1 block">
                    {section.severity === "major" ? "Penting" : "Sekunder"}
                    {section.beta ? " · beta" : ""}
                    {section.temuan > 0 ? ` · ${section.temuan} temuan` : ""}
                  </span>
                </span>
              </Link>
            </Sheet>
          );
        })}
      </ol>

      <h2 className="mt-8 text-lg font-semibold">Data unit</h2>
      <Sheet className="mt-3 p-4">
        <DataRow
          label="Odometer"
          value={ws.inspection.odometerKm ? formatKm(ws.inspection.odometerKm) : "—"}
        />
        <DataRow
          label="Harga diminta"
          value={
            ws.inspection.askingPrice ? formatRupiah(ws.inspection.askingPrice) : "—"
          }
        />
        <DataRow label="Plat" value={ws.vehicle.plateNo || "—"} />
        <div className="mt-4">
          <DetailKendaraan
            inspectionId={ws.inspection.id}
            odometerKm={ws.inspection.odometerKm}
            askingPrice={ws.inspection.askingPrice}
            sellerNote={ws.inspection.sellerNote}
          />
        </div>
      </Sheet>

      <h2 className="mt-8 text-lg font-semibold">Ada yang belum tercakup?</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Kalau ada pemeriksaan penting untuk mobil ini yang tidak ada di checklist,
        tulis di sini. Usulan yang sering masuk akan ditambahkan.
      </p>
      <Sheet className="mt-3 p-4">
        <UsulItem inspectionId={ws.inspection.id} />
      </Sheet>

      {/* Action bar melayang: dipakai satu tangan sambil berdiri di dekat mobil. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sheet/95 backdrop-blur"
        data-print="hide"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          {lanjut ? (
            <ButtonLink
              href={`/inspeksi/${ws.inspection.id}/bagian/${lanjut.key}`}
              size="lg"
              className="flex-1"
            >
              Lanjut: {lanjut.title}
            </ButtonLink>
          ) : (
            <form action={selesaikanInspeksiAction} className="flex-1">
              <input type="hidden" name="inspectionId" value={ws.inspection.id} />
              <Button type="submit" size="lg" className="w-full">
                Selesaikan & lihat hasil
              </Button>
            </form>
          )}
          <ButtonLink
            href={`/inspeksi/${ws.inspection.id}/hasil`}
            variant="garis"
            size="lg"
          >
            Hasil
          </ButtonLink>
        </div>
      </div>
    </Page>
  );
}
