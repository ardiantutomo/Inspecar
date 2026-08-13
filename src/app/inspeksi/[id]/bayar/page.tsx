import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { bayarReportAction } from "@/app/actions/bayar";
import { Button, ButtonLink } from "@/components/ui/button";
import { DataRow, MicroLabel, Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PAYMENT_MODE, REPORT_PRICE_IDR } from "@/lib/env";
import { formatInspectionCode } from "@/lib/report";
import { formatRupiah } from "@/lib/scoring/rupiah";

export const metadata: Metadata = { title: "Buka report lengkap" };

export default async function BayarPage({ params }: PageProps<"/inspeksi/[id]/bayar">) {
  const { id } = await params;
  const user = await requireUser(`/inspeksi/${id}/bayar`);

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!inspection || inspection.userId !== user.id) notFound();
  if (inspection.paidAt) redirect(`/inspeksi/${inspection.id}/hasil`);

  return (
    <Page width="narrow" className="max-w-lg">
      <PageHeading
        eyebrow="Report lengkap"
        title="Konfirmasi pembayaran"
        lead="Sekali bayar untuk inspeksi ini. Tidak ada langganan."
      />

      <Sheet className="p-4 sm:p-5">
        <DataRow
          label="Kendaraan"
          value={`${inspection.vehicle.brand} ${inspection.vehicle.model}`}
          mono={false}
        />
        <DataRow label="Tahun" value={inspection.vehicle.yearRange} />
        <DataRow label="Kode inspeksi" value={formatInspectionCode(inspection.id)} />
        <DataRow label="Total" value={formatRupiah(REPORT_PRICE_IDR)} />

        {PAYMENT_MODE === "mock" ? (
          <div className="mt-5 rounded-sheet border-l-[3px] border-caution pl-3">
            <MicroLabel className="block">Mode simulasi</MicroLabel>
            <p className="mt-1 text-sm text-ink-soft">
              Payment gateway belum terhubung. Menekan tombol di bawah langsung
              membuka report tanpa tagihan sungguhan, supaya alurnya bisa diuji.
            </p>
          </div>
        ) : null}

        <form action={bayarReportAction} className="mt-5">
          <input type="hidden" name="inspectionId" value={inspection.id} />
          <Button type="submit" size="lg" className="w-full">
            Bayar {formatRupiah(REPORT_PRICE_IDR)} & buka report
          </Button>
        </form>

        <ButtonLink
          href={`/inspeksi/${inspection.id}/hasil`}
          variant="sunyi"
          className="mt-3 w-full"
        >
          Nanti dulu
        </ButtonLink>
      </Sheet>
    </Page>
  );
}
