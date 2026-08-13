"use client";

import { useActionState } from "react";
import { terapkanDemoteAction } from "@/app/actions/kurasi";
import { Button } from "@/components/ui/button";

export function JalankanDemote({ jumlah }: { jumlah: number }) {
  const [state, action, pending] = useActionState(terapkanDemoteAction, {});

  return (
    <form action={action} className="flex items-center gap-3">
      <Button type="submit" variant="garis" disabled={pending}>
        {pending ? "Menerapkan…" : `Terapkan ${jumlah} demote`}
      </Button>
      {state.pesan && <span className="text-sm text-clear">{state.pesan}</span>}
    </form>
  );
}
