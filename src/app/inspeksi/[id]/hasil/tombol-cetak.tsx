"use client";

import { Button } from "@/components/ui/button";
import { MicroLabel, Sheet } from "@/components/ui/sheet";

export function TombolCetak() {
  return (
    <Sheet className="p-4">
      <MicroLabel>Simpan sebagai PDF</MicroLabel>
      <p className="mt-2 text-sm text-ink-soft">
        Halaman ini punya versi cetak. Dari dialog cetak, pilih “Simpan sebagai
        PDF” untuk dibawa saat menawar.
      </p>
      <Button
        type="button"
        variant="garis"
        className="mt-3"
        onClick={() => window.print()}
      >
        Buka dialog cetak
      </Button>
    </Sheet>
  );
}
