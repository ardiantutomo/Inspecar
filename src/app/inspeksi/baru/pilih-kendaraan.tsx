"use client";

import { useActionState, useMemo, useState } from "react";
import { type BaruState, mulaiInspeksiAction } from "@/app/actions/inspeksi";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input, Select } from "@/components/ui/field";
import { MicroLabel } from "@/components/ui/sheet";
import type { CatalogBrand } from "@/lib/catalog";

export function PilihKendaraan({
  catalog,
  tierBAktif,
}: {
  catalog: CatalogBrand[];
  tierBAktif: boolean;
}) {
  const [state, action, pending] = useActionState<BaruState, FormData>(
    mulaiInspeksiAction,
    {},
  );

  const [manual, setManual] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const models = useMemo(
    () => catalog.find((entry) => entry.brand === brand)?.models ?? [],
    [catalog, brand],
  );
  const yearRanges = useMemo(
    () => models.find((entry) => entry.model === model)?.yearRanges ?? [],
    [models, model],
  );

  return (
    <form action={action} className="space-y-5">
      <FormError>{state.error}</FormError>

      {manual ? (
        <>
          <Field label="Merk" htmlFor="brand-manual">
            <Input
              id="brand-manual"
              name="brand"
              required
              placeholder="mis. Chevrolet"
              autoComplete="off"
            />
          </Field>
          <Field label="Model" htmlFor="model-manual">
            <Input
              id="model-manual"
              name="model"
              required
              placeholder="mis. Spin"
              autoComplete="off"
            />
          </Field>
          <Field
            label="Rentang tahun"
            hint="Tulis seperti 2013-2017, atau satu tahun saja."
            htmlFor="year-range-manual"
          >
            <Input
              id="year-range-manual"
              name="yearRange"
              required
              placeholder="2013-2017"
              inputMode="numeric"
              className="data-num"
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Merk" htmlFor="brand">
            <Select
              id="brand"
              name="brand"
              required
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setModel("");
              }}
            >
              <option value="">Pilih merk</option>
              {catalog.map((entry) => (
                <option key={entry.brand} value={entry.brand}>
                  {entry.brand}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Model" htmlFor="model">
            <Select
              id="model"
              name="model"
              required
              value={model}
              disabled={models.length === 0}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="">
                {models.length === 0 ? "Pilih merk dulu" : "Pilih model"}
              </option>
              {models.map((entry) => (
                <option key={entry.model} value={entry.model}>
                  {entry.model}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tahun / generasi" htmlFor="yearRange">
            <Select
              id="yearRange"
              name="yearRange"
              required
              disabled={yearRanges.length === 0}
              className="data-num"
            >
              <option value="">
                {yearRanges.length === 0 ? "Pilih model dulu" : "Pilih tahun"}
              </option>
              {yearRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}

      <button
        type="button"
        onClick={() => setManual((value) => !value)}
        className="text-sm font-medium text-ink underline underline-offset-4"
      >
        {manual ? "Pilih dari daftar model" : "Modelnya tidak ada di daftar"}
      </button>

      <div className="border-t border-line pt-5">
        <MicroLabel className="block">Opsional</MicroLabel>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Transmisi" htmlFor="transmission">
            <Select id="transmission" name="transmission" defaultValue="">
              <option value="">Belum tahu</option>
              <option value="matic">Matic</option>
              <option value="manual">Manual</option>
            </Select>
          </Field>

          <Field label="Tahun unit" htmlFor="year">
            <Input
              id="year"
              name="year"
              inputMode="numeric"
              placeholder="2015"
              className="data-num"
            />
          </Field>

          <Field label="Odometer (km)" htmlFor="odometerKm">
            <Input
              id="odometerKm"
              name="odometerKm"
              inputMode="numeric"
              placeholder="120000"
              className="data-num"
            />
          </Field>

          <Field label="Harga diminta (Rp)" htmlFor="askingPrice">
            <Input
              id="askingPrice"
              name="askingPrice"
              inputMode="numeric"
              placeholder="145000000"
              className="data-num"
            />
          </Field>

          <Field label="Plat nomor" htmlFor="plateNo">
            <Input
              id="plateNo"
              name="plateNo"
              placeholder="B 1234 XYZ"
              className="data-num"
            />
          </Field>

          <Field label="Varian / mesin" htmlFor="variant">
            <Input id="variant" name="variant" placeholder="1.3 G" />
          </Field>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Menyiapkan checklist…" : "Mulai inspeksi"}
      </Button>

      {tierBAktif && (
        <p className="text-sm text-ink-soft">
          Untuk model yang belum pernah diperiksa, penyusunan daftar penyakit khas
          model bisa memakan waktu sampai satu menit. Checklist universalnya sudah
          siap seketika.
        </p>
      )}
    </form>
  );
}
