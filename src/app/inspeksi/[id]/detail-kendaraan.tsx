"use client";

import { useActionState, useState } from "react";
import { perbaruiDetailInspeksiAction } from "@/app/actions/inspeksi";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

export function DetailKendaraan({
  inspectionId,
  odometerKm,
  askingPrice,
  sellerNote,
}: {
  inspectionId: string;
  odometerKm: number | null;
  askingPrice: number | null;
  sellerNote: string | null;
}) {
  const [terbuka, setTerbuka] = useState(false);
  const [state, action, pending] = useActionState(perbaruiDetailInspeksiAction, {});

  if (!terbuka) {
    return (
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        className="text-sm font-medium text-ink underline underline-offset-4"
      >
        Ubah data unit
      </button>
    );
  }

  return (
    <form action={action} className="space-y-4 border-t border-line pt-4">
      <input type="hidden" name="inspectionId" value={inspectionId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Odometer (km)" htmlFor="odometerKm">
          <Input
            id="odometerKm"
            name="odometerKm"
            inputMode="numeric"
            defaultValue={odometerKm ?? ""}
            className="data-num"
          />
        </Field>
        <Field label="Harga diminta (Rp)" htmlFor="askingPrice">
          <Input
            id="askingPrice"
            name="askingPrice"
            inputMode="numeric"
            defaultValue={askingPrice ?? ""}
            className="data-num"
          />
        </Field>
      </div>

      <Field label="Catatan penjual" htmlFor="sellerNote">
        <Textarea
          id="sellerNote"
          name="sellerNote"
          rows={3}
          defaultValue={sellerNote ?? ""}
          placeholder="Klaim penjual yang perlu kamu ingat, mis. sudah ganti kopling tahun lalu."
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
        <button
          type="button"
          onClick={() => setTerbuka(false)}
          className="text-sm text-ink-soft underline underline-offset-4"
        >
          Tutup
        </button>
        {state.pesan && <span className="text-sm text-clear">{state.pesan}</span>}
      </div>
    </form>
  );
}
