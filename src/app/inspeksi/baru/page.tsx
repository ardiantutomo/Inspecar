import type { Metadata } from "next";
import { PilihKendaraan } from "@/app/inspeksi/baru/pilih-kendaraan";
import { MicroLabel, Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { requireUser } from "@/lib/auth";
import { CATALOG } from "@/lib/catalog";
import { isLlmConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Inspeksi baru" };

export default async function InspeksiBaru() {
  await requireUser("/inspeksi/baru");

  return (
    <Page width="narrow">
      <PageHeading
        eyebrow="Langkah 1 dari 3"
        title="Mobil apa yang mau kamu periksa?"
        lead="Dipakai untuk menyesuaikan checklist. Kalau modelnya tidak ada di daftar, tulis sendiri — checklist universalnya tetap berlaku."
      />

      <Sheet className="p-5">
        <PilihKendaraan catalog={CATALOG} tierBAktif={isLlmConfigured()} />
      </Sheet>

      <p className="mt-4 max-w-lg text-sm text-ink-soft">
        Angka KM dan harga yang diminta boleh dikosongkan sekarang. Keduanya
        dipakai di report untuk membandingkan harga dengan perkiraan biaya
        perbaikan.
      </p>
      <MicroLabel className="mt-6 block">
        Checklist dasar gratis · report lengkap opsional
      </MicroLabel>
    </Page>
  );
}
