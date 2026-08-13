"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UnlockCard({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    await fetch(`/api/inspeksi/${inspectionId}/unlock`, { method: "POST" });
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-6 text-center">
      <Lock className="mx-auto h-5 w-5 text-[var(--ink-soft)]" strokeWidth={1.75} />
      <h3 className="mt-3 font-display font-semibold text-[var(--ink)]">Buka laporan lengkap</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--ink-soft)]">
        Rincian tiap temuan, foto, catatan, dan estimasi biaya perbaikan per item — bahan konkret untuk negosiasi.
      </p>
      <Button onClick={handleUnlock} disabled={loading} className="mt-4">
        {loading ? "Memproses…" : "Bayar Rp 25.000 (demo)"}
      </Button>
      <p className="mt-2 text-xs text-[var(--ink-soft)]">
        Belum terhubung payment gateway sungguhan — tombol ini langsung membuka akses untuk demo.
      </p>
    </div>
  );
}
