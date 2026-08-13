"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  catatImpresiAction,
  simpanJawabanAction,
  tandaiTidakRelevanAction,
} from "@/app/actions/inspeksi";
import { KartuItem } from "@/app/inspeksi/[id]/bagian/[bagian]/kartu-item";
import { buttonClass } from "@/components/ui/button";
import type { Result } from "@/lib/checklist/answers";
import type { ChecklistItem } from "@/lib/checklist/schema";
import type { AnswerView } from "@/lib/workspace";

type Navigasi = {
  sebelum: { key: string; title: string } | null;
  sesudah: { key: string; title: string } | null;
};

export function FormBagian({
  inspectionId,
  sectionKey,
  items,
  answers,
  photos,
  terkunci,
  navigasi,
}: {
  inspectionId: string;
  sectionKey: string;
  items: ChecklistItem[];
  answers: Record<string, AnswerView>;
  photos: Record<string, string[]>;
  terkunci: boolean;
  navigasi: Navigasi;
}) {
  const [state, setState] = useState<Record<string, AnswerView>>(answers);
  const [status, setStatus] = useState<"diam" | "menyimpan" | "tersimpan" | "gagal">(
    "diam",
  );
  const [, startTransition] = useTransition();

  // Impressions dicatat sekali saat bagian ini dibuka (PRD §6.1).
  useEffect(() => {
    startTransition(async () => {
      await catatImpresiAction({ inspectionId, sectionKey }).catch(() => {});
    });
  }, [inspectionId, sectionKey, startTransition]);

  const terjawab = useMemo(
    () => items.filter((item) => state[item.id] !== undefined).length,
    [items, state],
  );

  function simpan(item: ChecklistItem, next: Partial<AnswerView>) {
    const sebelumnya = state[item.id];
    const gabungan: AnswerView = {
      result: next.result ?? sebelumnya?.result ?? "tidak_dicek",
      detail: next.detail ?? sebelumnya?.detail ?? null,
      flagIrrelevant: next.flagIrrelevant ?? sebelumnya?.flagIrrelevant ?? false,
    };

    setState((current) => ({ ...current, [item.id]: gabungan }));
    setStatus("menyimpan");

    startTransition(async () => {
      const hasil = await simpanJawabanAction({
        inspectionId,
        itemId: item.id,
        sectionKey,
        result: gabungan.result,
        detail: gabungan.detail,
      });
      setStatus(hasil.ok ? "tersimpan" : "gagal");
    });
  }

  function tandai(item: ChecklistItem, flagged: boolean) {
    setState((current) => ({
      ...current,
      [item.id]: {
        result: current[item.id]?.result ?? "tidak_dicek",
        detail: current[item.id]?.detail ?? null,
        flagIrrelevant: flagged,
      },
    }));

    startTransition(async () => {
      await tandaiTidakRelevanAction({ inspectionId, itemId: item.id, flagged });
    });
  }

  return (
    <div>
      {terkunci && (
        <p className="mb-5 rounded-sheet border-l-[3px] border-caution bg-sheet px-3 py-2 text-sm">
          Inspeksi ini sudah ditutup. Buka kembali dari halaman hasil kalau mau
          mengubah jawaban.
        </p>
      )}

      <ol className="grid gap-3">
        {items.map((item, index) => (
          <KartuItem
            key={item.id}
            nomor={index + 1}
            item={item}
            inspectionId={inspectionId}
            answer={state[item.id]}
            photoIds={photos[item.id] ?? []}
            terkunci={terkunci}
            onPilih={(result: Result) => simpan(item, { result })}
            onDetail={(detail: string) => simpan(item, { detail })}
            onTandai={(flagged: boolean) => tandai(item, flagged)}
          />
        ))}
      </ol>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sheet/95 backdrop-blur"
        data-print="hide"
      >
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="data-num text-xs text-ink-soft">
              {terjawab}/{items.length} terisi
              {status === "menyimpan" && " · menyimpan…"}
              {status === "tersimpan" && " · tersimpan"}
              {status === "gagal" && " · gagal menyimpan"}
            </span>
            <div className="flex items-center gap-2">
              {navigasi.sebelum && (
                <Link
                  href={`/inspeksi/${inspectionId}/bagian/${navigasi.sebelum.key}`}
                  className={buttonClass("garis")}
                >
                  Sebelumnya
                </Link>
              )}
              {navigasi.sesudah ? (
                <Link
                  href={`/inspeksi/${inspectionId}/bagian/${navigasi.sesudah.key}`}
                  className={buttonClass("utama")}
                >
                  Bagian berikutnya
                </Link>
              ) : (
                <Link href={`/inspeksi/${inspectionId}`} className={buttonClass("utama")}>
                  Kembali ke ringkasan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
