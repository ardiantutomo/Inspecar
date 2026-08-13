import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { findVehicle } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { StartInspectionForm } from "@/components/StartInspectionForm";
import { BetaBadge } from "@/components/ui/Badge";

export default async function PilihTahunPage({ params }: { params: Promise<{ brand: string; model: string }> }) {
  await requireUser();
  const { brand, model } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const decodedModel = decodeURIComponent(model);
  const vehicle = findVehicle(decodedBrand, decodedModel);

  if (!vehicle) notFound();

  return (
    <Container className="max-w-md py-10 sm:py-14">
      <Link href={`/mulai/${encodeURIComponent(vehicle.brand)}`} className="text-sm text-[var(--ink-soft)] hover:text-[var(--brand-ink)]">
        ← Ganti model
      </Link>
      <p className="mt-3 font-data text-xs uppercase tracking-wide text-[var(--brand-ink)]">Langkah 3 dari 3</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
        {vehicle.brand} {vehicle.model}
      </h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">Pilih tahun yang paling mendekati unit yang mau kamu periksa.</p>

      {vehicle.tierBSlug ? (
        <p className="mt-3">
          <BetaBadge /> <span className="ml-1 text-xs text-[var(--ink-soft)]">Ada beberapa titik cek khas model ini</span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--ink-soft)]">
          Belum ada titik cek khas model ini — kamu tetap akan mendapat checklist universal lengkap.
        </p>
      )}

      <Card className="mt-6">
        <StartInspectionForm brand={vehicle.brand} model={vehicle.model} yearStart={vehicle.yearStart} yearEnd={vehicle.yearEnd} />
      </Card>
    </Container>
  );
}
