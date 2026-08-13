import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  bukaKembaliInspeksiAction,
  selesaikanInspeksiAction,
} from "@/app/actions/inspeksi";
import { BagikanReport } from "@/app/inspeksi/[id]/hasil/bagikan-report";
import { TombolCetak } from "@/app/inspeksi/[id]/hasil/tombol-cetak";
import { ReportView } from "@/components/report-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { MicroLabel, Page, Sheet } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APP_URL, REPORT_PRICE_IDR } from "@/lib/env";
import { loadReport } from "@/lib/report";
import { formatRupiah } from "@/lib/scoring/rupiah";

export const metadata: Metadata = { title: "Hasil inspeksi" };

const YANG_DIBUKA = [
  "Putusan layak / hati-hati / batal beserta alasannya",
  "Perkiraan total biaya perbaikan dari temuanmu",
  "Daftar bahan menawar dengan angka per temuan",
  "Ringkasan yang bisa dibaca orang lain",
  "Link untuk dibagikan & versi cetak/PDF",
];

export default async function HasilPage({
  params,
}: PageProps<"/inspeksi/[id]/hasil">) {
  const { id } = await params;
  const user = await requireUser(`/inspeksi/${id}/hasil`);

  const pemilik = await prisma.inspection.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (pemilik?.userId !== user.id) notFound();

  const data = await loadReport(id);
  if (!data) notFound();

  const selesai = data.inspection.status === "selesai";
  const terbuka = data.inspection.isPaid && selesai;

  return (
    <Page width="narrow" className="pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3" data-print="hide">
        <MicroLabel>
          {selesai ? "Inspeksi selesai" : "Masih berjalan · hasil sementara"}
        </MicroLabel>
        <div className="flex items-center gap-2">
          {selesai ? (
            <form action={bukaKembaliInspeksiAction}>
              <input type="hidden" name="inspectionId" value={data.inspection.id} />
              <Button type="submit" variant="garis">
                Buka kembali
              </Button>
            </form>
          ) : (
            <form action={selesaikanInspeksiAction}>
              <input type="hidden" name="inspectionId" value={data.inspection.id} />
              <Button type="submit" variant="garis">
                Tandai selesai
              </Button>
            </form>
          )}
          <ButtonLink href={`/inspeksi/${data.inspection.id}`} variant="sunyi">
            Kembali mengisi
          </ButtonLink>
        </div>
      </div>

      {!terbuka && (
        <Sheet className="mb-8 p-4 sm:p-5" >
          <MicroLabel>Report lengkap</MicroLabel>
          <h2 className="mt-2 text-xl font-semibold">
            Buka putusan & perkiraan biaya
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Checklist dan semua jawabanmu gratis dan tetap bisa kamu lihat di bawah.
            Yang berbayar adalah bagian yang mengubah catatan jadi keputusan:
          </p>
          <ul className="mt-3 space-y-1.5">
            {YANG_DIBUKA.map((baris) => (
              <li key={baris} className="border-l-[3px] border-line pl-3 text-sm">
                {baris}
              </li>
            ))}
          </ul>

          {selesai ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/inspeksi/${data.inspection.id}/bayar`} size="lg">
                Buka report — {formatRupiah(REPORT_PRICE_IDR)}
              </ButtonLink>
              <span className="text-sm text-ink-soft">Sekali bayar per inspeksi.</span>
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink-soft">
              Selesaikan inspeksinya dulu supaya putusan dihitung dari data yang
              lengkap.
            </p>
          )}
        </Sheet>
      )}

      <ReportView data={data} terbuka={terbuka} />

      {terbuka && data.inspection.shareToken && (
        <div className="mt-8 grid gap-3" data-print="hide">
          <BagikanReport
            url={`${APP_URL}/laporan/${data.inspection.shareToken}`}
          />
          <TombolCetak />
        </div>
      )}
    </Page>
  );
}
