import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DaftarForm } from "@/app/daftar/daftar-form";
import { Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar" };

export default async function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  const user = await getCurrentUser();
  const { lanjut } = await searchParams;
  const next = typeof lanjut === "string" ? lanjut : "/inspeksi/baru";

  if (user) redirect(next);

  return (
    <Page width="narrow" className="max-w-md">
      <PageHeading
        eyebrow="Akun"
        title="Buat akun"
        lead="Cukup tiga isian. Checklist dasar gratis; kamu hanya bayar kalau mau report lengkapnya."
      />
      <Sheet className="p-5">
        <DaftarForm next={next} />
      </Sheet>
      <p className="mt-4 text-sm text-ink-soft">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-ink underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </Page>
  );
}
