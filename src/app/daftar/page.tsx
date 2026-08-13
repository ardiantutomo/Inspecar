import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Daftar — Periksa Dulu" };

export default async function DaftarPage() {
  const user = await getCurrentUser();
  if (user) redirect("/akun");

  return (
    <Container className="max-w-md py-14 sm:py-20">
      <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">Buat akun</h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Gratis. Dipakai untuk menyimpan riwayat inspeksimu.</p>
      <Card className="mt-6">
        <RegisterForm />
      </Card>
      <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-[var(--brand-ink)] underline underline-offset-2">
          Masuk
        </Link>
      </p>
    </Container>
  );
}
