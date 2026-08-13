"use client";

import { AppShell } from "@/components/AppShell";
import { Button, FieldLabel, Select, TextInput, SectionCard } from "@/components/ui";
import {
  getBrands,
  getModels,
  getYearRanges,
  VEHICLE_CATALOG,
} from "@/data/catalog";
import { createId, saveInspection } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function PilihPage() {
  const router = useRouter();
  const brands = useMemo(() => getBrands(), []);
  const [brand, setBrand] = useState("Toyota");
  const models = useMemo(() => getModels(brand), [brand]);
  const [model, setModel] = useState("Avanza");
  const years = useMemo(() => getYearRanges(brand, model), [brand, model]);
  const [yearRange, setYearRange] = useState("2015-2019");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const popular = VEHICLE_CATALOG.filter((v) => v.popular).slice(0, 8);

  function syncModelForBrand(nextBrand: string) {
    const nextModels = getModels(nextBrand);
    const nextModel = nextModels[0] ?? "";
    const nextYears = getYearRanges(nextBrand, nextModel);
    setBrand(nextBrand);
    setModel(nextModel);
    setYearRange(nextYears[0] ?? "");
  }

  function syncYearsForModel(nextModel: string) {
    const nextYears = getYearRanges(brand, nextModel);
    setModel(nextModel);
    setYearRange(nextYears[0] ?? "");
  }

  function start() {
    if (!brand || !model || !yearRange) return;
    const now = new Date().toISOString();
    const id = createId();
    saveInspection({
      id,
      createdAt: now,
      updatedAt: now,
      brand,
      model,
      year_range: yearRange,
      year: year ? Number(year) : undefined,
      plate: plate.trim() || undefined,
      template_id: "",
      template_version: 1,
      answers: {},
      unlocked: false,
      currentSectionIndex: 0,
    });
    router.push(`/inspeksi/${id}`);
  }

  return (
    <AppShell>
      <div className="animate-rise">
        <p className="text-sm font-medium text-brand">Langkah 1</p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink">
          Pilih kendaraan
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pilih model yang sedang kamu lihat. Checklist akan menyesuaikan.
        </p>
      </div>

      <div className="animate-rise delay-1 mt-5 flex gap-2 overflow-x-auto pb-1">
        {popular.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => {
              setBrand(v.brand);
              setModel(v.model);
              setYearRange(v.year_range);
            }}
            className="shrink-0 rounded-[6px] border border-line bg-surface-raised px-3 py-2 text-left text-sm hover:border-brand/40"
          >
            <span className="block font-medium text-ink">
              {v.brand} {v.model}
            </span>
            <span className="font-data text-xs text-ink-muted">{v.year_range}</span>
          </button>
        ))}
      </div>

      <SectionCard className="animate-rise delay-2 mt-5 space-y-4">
        <div>
          <FieldLabel htmlFor="brand">Merk</FieldLabel>
          <Select
            id="brand"
            value={brand}
            onChange={(e) => syncModelForBrand(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="model">Model</FieldLabel>
          <Select
            id="model"
            value={model}
            onChange={(e) => syncYearsForModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="year_range">Rentang tahun / generasi</FieldLabel>
          <Select
            id="year_range"
            value={yearRange}
            onChange={(e) => setYearRange(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="year">Tahun unit (opsional)</FieldLabel>
            <TextInput
              id="year"
              inputMode="numeric"
              placeholder="2017"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="plate">Plat (opsional)</FieldLabel>
            <TextInput
              id="plate"
              placeholder="B 1234 XX"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <Button type="button" className="w-full" onClick={start}>
          Mulai inspeksi
        </Button>
      </SectionCard>
    </AppShell>
  );
}
