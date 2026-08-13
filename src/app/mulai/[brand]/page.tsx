import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getModelsByBrand } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { BetaBadge } from "@/components/ui/Badge";

export default async function PilihModelPage({ params }: { params: Promise<{ brand: string }> }) {
  await requireUser();
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const models = getModelsByBrand(decodedBrand);

  if (models.length === 0) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/mulai" className="text-sm text-[var(--ink-soft)] hover:text-[var(--brand-ink)]">
        ← Ganti merk
      </Link>
      <p className="mt-3 font-data text-xs uppercase tracking-wide text-[var(--brand-ink)]">Langkah 2 dari 3</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">Pilih model {decodedBrand}</h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Model mana yang mau diperiksa?</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {models.map((vehicle) => (
          <Link
            key={vehicle.model}
            href={`/mulai/${encodeURIComponent(vehicle.brand)}/${encodeURIComponent(vehicle.model)}`}
            className="tap-target flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-4 text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
          >
            <span>
              <span className="font-medium">{vehicle.model}</span>
              <span className="font-data ml-2 text-xs text-[var(--ink-soft)]">
                {vehicle.yearStart}–{vehicle.yearEnd}
              </span>
            </span>
            {vehicle.tierBSlug && <BetaBadge />}
          </Link>
        ))}
      </div>
    </Container>
  );
}
