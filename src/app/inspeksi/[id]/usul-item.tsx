"use client";

import { useActionState } from "react";
import { usulItemAction } from "@/app/actions/inspeksi";
import { Button } from "@/components/ui/button";
import { Field, FormError, Textarea } from "@/components/ui/field";

export function UsulItem({ inspectionId }: { inspectionId: string }) {
  const [state, action, pending] = useActionState(usulItemAction, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="inspectionId" value={inspectionId} />
      <FormError>{state.error}</FormError>

      <Field label="Usulan pemeriksaan" htmlFor="text">
        <Textarea
          id="text"
          name="text"
          rows={3}
          placeholder="mis. Cek bunyi dengung dari gardan saat kecepatan 60 km/jam."
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="garis" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim usulan"}
        </Button>
        {state.pesan && <span className="text-sm text-clear">{state.pesan}</span>}
      </div>
    </form>
  );
}
