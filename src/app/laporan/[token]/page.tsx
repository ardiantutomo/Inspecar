import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { MicroLabel, Page } from "@/components/ui/sheet";
import { prisma } from "@/lib/db";
import { loadReport } from "@/lib/report";

export const metadata: Metadata = {
  title: "Hasil inspeksi",
  robots: { index: false, follow: false },
};

/**
 * Halaman publik untuk share link (docs/prd.md §9 keputusan 6). Tanpa akun,
 * hanya bisa dibuka dengan token, dan hanya untuk report yang sudah dibuka.
 */
export default async function LaporanPublik({ params }: PageProps<"/laporan/[token]">) {
  const { token } = await params;

  const inspection = await prisma.inspection.findUnique({
    where: { shareToken: token },
    select: { id: true, paidAt: true, status: true },
  });
  if (!inspection || !inspection.paidAt || inspection.status !== "selesai") {
    notFound();
  }

  const data = await loadReport(inspection.id);
  if (!data) notFound();

  return (
    <Page width="narrow" className="pb-16">
      <div className="mb-6" data-print="hide">
        <MicroLabel>Dibagikan oleh pemeriksa</MicroLabel>
        <p className="mt-2 text-sm text-ink-soft">
          Ini hasil pemeriksaan satu unit mobil bekas pada tanggal tertera. Isinya
          catatan orang yang memeriksa, bukan sertifikasi resmi.
        </p>
      </div>

      <ReportView data={data} terbuka shareToken={token} />

      <div className="mt-10 border-t border-line pt-5" data-print="hide">
        <p className="text-sm text-ink-soft">
          Mau memeriksa mobil incaranmu sendiri?{" "}
          <Link href="/" className="font-medium text-ink underline underline-offset-4">
            Lihat cara kerjanya
          </Link>
          .
        </p>
      </div>
    </Page>
  );
}
