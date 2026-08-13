import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MasukForm } from "@/app/masuk/masuk-form";
import { Page, PageHeading, Sheet } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  const user = await getCurrentUser();
  const { lanjut } = await searchParams;
  const next = typeof lanjut === "string" ? lanjut : "/inspeksi";

  if (user) redirect(next);

  return (
    <Page width="narrow" className="max-w-md">
      <PageHeading
        eyebrow="Akun"
        title="Masuk"
        lead="Inspeksi yang sedang kamu kerjakan tersimpan di akun ini."
      />
      <Sheet className="p-5">
        <MasukForm next={next} />
      </Sheet>
      <p className="mt-4 text-sm text-ink-soft">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-ink underline underline-offset-4">
          Daftar
        </Link>
      </p>
    </Page>
  );
}
