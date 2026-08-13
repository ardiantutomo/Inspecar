"use client";

import { useId, useState } from "react";
import { UnggahFoto } from "@/app/inspeksi/[id]/bagian/[bagian]/unggah-foto";
import { Textarea } from "@/components/ui/field";
import { MicroLabel } from "@/components/ui/sheet";
import { BetaTag, RESULT_BORDER, RESULT_TEXT } from "@/components/ui/severity";
import {
  needsDetail,
  needsPhoto,
  type Result,
  resultOptions,
} from "@/lib/checklist/answers";
import type { ChecklistItem } from "@/lib/checklist/schema";
import type { AnswerView } from "@/lib/workspace";

export function KartuItem({
  nomor,
  item,
  inspectionId,
  answer,
  photoIds,
  terkunci,
  onPilih,
  onDetail,
  onTandai,
}: {
  nomor: number;
  item: ChecklistItem;
  inspectionId: string;
  answer?: AnswerView;
  photoIds: string[];
  terkunci: boolean;
  onPilih: (result: Result) => void;
  onDetail: (detail: string) => void;
  onTandai: (flagged: boolean) => void;
}) {
  const grup = useId();
  const [detail, setDetail] = useState(answer?.detail ?? "");
  const opsi = resultOptions(item);
  const dipilih = answer?.result;
  const perluFoto = needsPhoto(item);
  const fotoKurang =
    perluFoto && photoIds.length === 0 && dipilih !== undefined && dipilih !== "tidak_dicek";

  return (
    <li
      className={`sheet rounded-sheet border border-line bg-sheet ${
        answer?.flagIrrelevant ? "opacity-60" : ""
      }`}
    >
      <div
        className={`border-l-[3px] p-4 ${
          dipilih ? RESULT_BORDER[dipilih] : "border-transparent"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <MicroLabel>
            {String(nomor).padStart(2, "0")} ·{" "}
            {item.severity === "major" ? "Penting" : item.severity === "minor" ? "Sekunder" : "Tambahan"}
          </MicroLabel>
          {item.tier === "B" && <BetaTag />}
        </div>

        <h2 className="mt-2 font-display text-[17px] font-semibold leading-snug">
          {item.label}
        </h2>

        <div className="mt-3 space-y-2 text-sm">
          <p className="text-ink-soft">
            <span className="micro-label mr-2">Cara cek</span>
            {item.cara_cek}
          </p>
          <p className="border-l-[3px] border-line pl-3 text-ink-soft">
            <span className="micro-label mr-2">Tanda bahaya</span>
            {item.tanda_bahaya}
          </p>
        </div>

        <fieldset className="mt-4" disabled={terkunci}>
          <legend className="micro-label">Hasil pemeriksaan</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {opsi.map((pilihan) => {
              const aktif = dipilih === pilihan.value;
              const id = `${grup}-${pilihan.value}`;
              return (
                <div key={pilihan.value}>
                  <input
                    type="radio"
                    id={id}
                    name={grup}
                    value={pilihan.value}
                    checked={aktif}
                    onChange={() => onPilih(pilihan.value)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-sheet border px-2 text-center text-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
                      aktif
                        ? `border-ink font-medium ${RESULT_TEXT[pilihan.value]}`
                        : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {pilihan.label}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        {(needsDetail(item) || dipilih === "perhatian" || dipilih === "bahaya") && (
          <div className="mt-4">
            <label htmlFor={`${grup}-detail`} className="micro-label block">
              {item.label_detail ?? "Catatan (opsional)"}
            </label>
            <Textarea
              id={`${grup}-detail`}
              rows={2}
              className="mt-2"
              value={detail}
              disabled={terkunci}
              placeholder={
                needsDetail(item)
                  ? "Tulis angka atau hasil ceknya."
                  : "Apa yang kamu lihat? Berguna saat minta pendapat orang lain."
              }
              onChange={(event) => setDetail(event.target.value)}
              onBlur={() => {
                if ((answer?.detail ?? "") !== detail) onDetail(detail);
              }}
            />
          </div>
        )}

        {perluFoto && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <MicroLabel>Foto {item.wajib_foto ? "(disarankan)" : ""}</MicroLabel>
              {fotoKurang && (
                <span className="text-xs text-caution">Belum ada foto</span>
              )}
            </div>
            <UnggahFoto
              inspectionId={inspectionId}
              itemId={item.id}
              photoIds={photoIds}
              terkunci={terkunci}
            />
          </div>
        )}

        <div className="mt-4 border-t border-line pt-3">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={answer?.flagIrrelevant ?? false}
              disabled={terkunci}
              onChange={(event) => onTandai(event.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Pemeriksaan ini tidak relevan untuk mobil ini
          </label>
        </div>
      </div>
    </li>
  );
}
