"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MicroLabel, Sheet } from "@/components/ui/sheet";

export function BagikanReport({ url }: { url: string }) {
  const [status, setStatus] = useState<"diam" | "tersalin" | "gagal">("diam");

  async function salin() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("tersalin");
    } catch {
      setStatus("gagal");
    }
  }

  return (
    <Sheet className="p-4">
      <MicroLabel>Bagikan hasil</MicroLabel>
      <p className="mt-2 text-sm text-ink-soft">
        Siapa pun yang punya link ini bisa membaca hasilnya tanpa perlu akun —
        berguna saat minta pendapat keluarga atau saat menawar.
      </p>
      <p className="data-num mt-3 break-all rounded-sheet border border-line bg-surface px-3 py-2 text-xs">
        {url}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="garis" onClick={salin}>
          Salin link
        </Button>
        {status === "tersalin" && <span className="text-sm text-clear">Tersalin.</span>}
        {status === "gagal" && (
          <span className="text-sm text-caution">
            Browser menolak menyalin. Salin manual dari kotak di atas.
          </span>
        )}
      </div>
    </Sheet>
  );
}
