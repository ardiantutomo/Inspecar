import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Masuk — Periksa Dulu" };

export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) redirect("/akun");

  return (
    <Container className="max-w-md py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">Masuk</h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Lanjutkan inspeksi atau lihat riwayat laporanmu.</p>
      <Card className="mt-6">
        <LoginForm />
      </Card>
      <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-[var(--brand-ink)] underline underline-offset-2">
          Daftar gratis
        </Link>
      </p>
    </Container>
  );
}
