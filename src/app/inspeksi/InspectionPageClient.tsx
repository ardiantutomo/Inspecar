"use client";

import { useSearchParams } from "next/navigation";
import { InspectionFlow } from "@/components/InspectionFlow";
import { getTierATemplate } from "@/lib/template";
import { VehicleOption } from "@/types/checklist";
import Link from "next/link";

export function InspectionPageClient() {
  const params = useSearchParams();
  const brand = params.get("brand") ?? "";
  const model = params.get("model") ?? "";
  const year = params.get("year") ?? "";
  const label = params.get("label") ?? `${brand} ${model}`;

  if (!brand || !model) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-4">
        <p className="text-ink/70">Kendaraan belum dipilih.</p>
        <Link href="/mulai" className="btn-primary">Pilih kendaraan</Link>
      </div>
    );
  }

  const vehicle: VehicleOption = { brand, model, year_range: year, label };
  const template = getTierATemplate();

  return <InspectionFlow vehicle={vehicle} template={template} />;
}
