"use client";

import { AppShell } from "@/components/AppShell";
import { Button, SectionCard } from "@/components/ui";
import { deleteInspection, listInspections } from "@/lib/storage";
import type { Inspection } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RiwayatPage() {
  const [items, setItems] = useState<Inspection[]>([]);

  function refresh() {
    setItems(listInspections());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AppShell>
      <div className="animate-rise">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Riwayat inspeksi
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Tersimpan di perangkat ini. Hapus bila sudah tidak dibutuhkan.
        </p>
      </div>

      {items.length === 0 ? (
        <SectionCard className="mt-5">
          <p className="text-sm text-ink-muted">Belum ada inspeksi.</p>
          <Link
            href="/pilih"
            className="mt-3 inline-flex text-sm font-medium text-brand"
          >
            Mulai inspeksi pertama
          </Link>
        </SectionCard>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <SectionCard>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold text-ink">
                      {item.brand} {item.model}
                    </p>
                    <p className="font-data mt-1 text-xs text-ink-muted">
                      {item.year_range}
                      {item.plate ? ` · ${item.plate}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Diperbarui{" "}
                      {new Date(item.updatedAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="rounded-[3px] bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                    {item.unlocked ? "Report terbuka" : "Dasar"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/inspeksi/${item.id}`}
                    className="tap-target inline-flex items-center justify-center rounded-[6px] bg-brand px-3 text-sm font-medium text-white"
                  >
                    Lanjut isi
                  </Link>
                  <Link
                    href={`/hasil/${item.id}`}
                    className="tap-target inline-flex items-center justify-center rounded-[6px] border border-line px-3 text-sm font-medium"
                  >
                    Lihat hasil
                  </Link>
                  <Button
                    variant="ghost"
                    className="!min-h-10 text-critical"
                    onClick={() => {
                      deleteInspection(item.id);
                      refresh();
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </SectionCard>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
