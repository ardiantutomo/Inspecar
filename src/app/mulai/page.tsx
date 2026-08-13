"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  BRANDS,
  getModelsForBrand,
  getVehiclesForBrandModel,
  searchVehicles,
} from "@/data/vehicles";
import { VehicleOption } from "@/types/checklist";

export default function MulaiPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selected, setSelected] = useState<VehicleOption | null>(null);

  const models = brand ? getModelsForBrand(brand) : [];
  const yearOptions = brand && model ? getVehiclesForBrandModel(brand, model) : [];
  const searchResults = useMemo(() => searchVehicles(search), [search]);

  const handleStart = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      brand: selected.brand,
      model: selected.model,
      year: selected.year_range,
      label: selected.label,
    });
    router.push(`/inspeksi?${params.toString()}`);
  };

  return (
    <div className="min-h-dvh bg-surface">
      <Header backHref="/" title="Pilih kendaraan" />

      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-ink/70">
          Pilih merk, model, dan tahun mobil yang akan kamu inspeksi.
        </p>

        {/* Quick search */}
        <div className="mt-4">
          <label htmlFor="search" className="text-sm font-medium text-ink">
            Cari cepat
          </label>
          <input
            id="search"
            type="search"
            className="input-field mt-1"
            placeholder="Ketik Avanza, HR-V, Ertiga..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          {search && (
            <ul className="mt-2 space-y-1">
              {searchResults.slice(0, 8).map((v) => (
                <li key={v.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(v);
                      setBrand(v.brand);
                      setModel(v.model);
                      setSearch(v.label);
                    }}
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-left text-sm hover:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {v.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="brand" className="text-sm font-medium text-ink">Merk</label>
            <select
              id="brand"
              className="input-field mt-1"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
                setSelected(null);
                setSearch("");
              }}
            >
              <option value="">Pilih merk</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {brand && (
            <div>
              <label htmlFor="model" className="text-sm font-medium text-ink">Model</label>
              <select
                id="model"
                className="input-field mt-1"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setSelected(null);
                }}
              >
                <option value="">Pilih model</option>
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {brand && model && (
            <div>
              <label htmlFor="year" className="text-sm font-medium text-ink">Tahun / generasi</label>
              <select
                id="year"
                className="input-field mt-1"
                value={selected?.year_range ?? ""}
                onChange={(e) => {
                  const v = yearOptions.find((y) => y.year_range === e.target.value);
                  if (v) setSelected(v);
                }}
              >
                <option value="">Pilih tahun</option>
                {yearOptions.map((v) => (
                  <option key={v.year_range} value={v.year_range}>
                    {v.year_range === "*" ? "Umum / tahun lain" : v.year_range}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selected && (
          <div className="mt-6 card p-4">
            <p className="font-mono text-xs text-ink/50">Kendaraan dipilih</p>
            <p className="mt-1 font-medium text-ink">{selected.label}</p>
            <p className="mt-2 text-xs text-ink/60">
              Checklist Tier A (universal) — berlaku untuk semua mobil bekas.
              Penyakit spesifik model (Tier B) menyusul di versi berikutnya.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={!selected}
          className="btn-primary mt-6 w-full"
        >
          Lanjut ke checklist
        </button>
      </main>
    </div>
  );
}
