"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PAYMENT_MODE, REPORT_PRICE_IDR } from "@/lib/env";

/**
 * Freemium (docs/prd.md §9 keputusan 2): checklist dasar gratis, report lengkap
 * berbayar sekali per inspeksi.
 *
 * `PAYMENT_MODE=mock` menyelesaikan pembayaran secara simulasi supaya alur
 * end-to-end bisa dipakai tanpa gateway. Saat integrasi Midtrans/Xendit, ganti
 * bagian yang ditandai di bawah dengan pembuatan transaksi + webhook; pengecekan
 * hak akses report tidak perlu berubah karena semuanya bertumpu pada `paidAt`.
 */
export async function bayarReportAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const inspectionId = String(formData.get("inspectionId") ?? "");

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
  });
  if (!inspection || inspection.userId !== user.id) {
    throw new Error("Inspeksi tidak ditemukan");
  }

  if (inspection.paidAt) redirect(`/inspeksi/${inspection.id}/hasil`);

  if (PAYMENT_MODE !== "mock") {
    // Titik integrasi gateway sungguhan.
    throw new Error(
      "PAYMENT_MODE=live belum terhubung ke payment gateway. Set PAYMENT_MODE=mock untuk uji alur.",
    );
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId: user.id,
        inspectionId: inspection.id,
        amount: REPORT_PRICE_IDR,
        status: "paid",
        provider: "mock",
        providerRef: `MOCK-${randomBytes(4).toString("hex").toUpperCase()}`,
        paidAt: now,
      },
    }),
    prisma.inspection.update({
      where: { id: inspection.id },
      data: {
        paidAt: now,
        // Share link jadi bagian dari report berbayar (PRD §9 keputusan 6).
        shareToken: inspection.shareToken ?? randomBytes(12).toString("hex"),
      },
    }),
  ]);

  redirect(`/inspeksi/${inspection.id}/hasil?baru=1`);
}
