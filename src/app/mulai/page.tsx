import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getBrands } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Pilih merk — Periksa Dulu" };

export default async function PilihMerkPage() {
  await requireUser();
  const brands = getBrands();

  return (
    <Container className="py-10 sm:py-14">
      <p className="font-data text-xs uppercase tracking-wide text-[var(--brand-ink)]">Langkah 1 dari 3</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">Pilih merk mobil</h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Mobil yang mau kamu periksa merknya apa?</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand}
            href={`/mulai/${encodeURIComponent(brand)}`}
            className="tap-target flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-5 text-center font-medium text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
          >
            {brand}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-[var(--ink-soft)]">
        Merk mobilmu belum ada di daftar? Katalog kami masih terbatas pada model-model terlaris. Fitur cari model
        lain akan menyusul.
      </p>
    </Container>
  );
}
