"use client";

import { BetaBadge, SeverityBadge } from "@/components/ui";
import type { ChecklistItem, ItemAnswer } from "@/lib/types";
import { useState } from "react";

const SCALE_LABELS = ["Buruk", "Kurang", "Cukup", "Baik", "Baik sekali"];

export function ChecklistItemCard({
  item,
  index,
  answer,
  isBeta,
  onChange,
}: {
  item: ChecklistItem;
  index: number;
  answer?: ItemAnswer;
  isBeta?: boolean;
  onChange: (next: ItemAnswer) => void;
}) {
  const [openGuide, setOpenGuide] = useState(false);
  const value = answer?.value ?? null;

  async function onPhoto(file: File | null) {
    if (!file) {
      onChange({ ...answer, value: answer?.value ?? null, photoDataUrl: undefined });
      return;
    }
    if (file.size > 1_800_000) {
      alert("Foto terlalu besar. Pakai foto di bawah ~1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...answer,
        value: answer?.value ?? (item.input_type === "photo" ? "ada" : answer?.value ?? null),
        photoDataUrl: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <article className="border-b border-line py-5 last:border-b-0">
      <div className="flex flex-wrap items-start gap-2">
        <span className="font-data mt-0.5 text-xs text-ink-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={item.severity} />
            {(isBeta || item.status === "beta") && <BetaBadge />}
            {item.wajib_foto && (
              <span className="text-[11px] font-medium text-ink-muted">
                Foto wajib
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold leading-snug text-ink">
            {item.label}
          </h3>

          <button
            type="button"
            onClick={() => setOpenGuide((v) => !v)}
            className="mt-2 text-sm font-medium text-brand hover:text-brand-deep"
          >
            {openGuide ? "Sembunyikan panduan" : "Cara cek & tanda bahaya"}
          </button>

          {openGuide && (
            <div className="mt-3 space-y-2 rounded-[6px] bg-surface px-3 py-3 text-sm leading-relaxed text-ink-muted">
              <p>
                <span className="font-medium text-ink">Cara cek: </span>
                {item.cara_cek}
              </p>
              <p>
                <span className="font-medium text-critical">Tanda bahaya: </span>
                {item.tanda_bahaya}
              </p>
              <p className="font-data text-xs">
                Estimasi perbaikan: {item.estimasi_biaya_perbaikan}
              </p>
            </div>
          )}

          <div className="mt-4">
            {item.input_type === "boolean" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`tap-target rounded-[6px] border text-sm font-medium ${
                    value === true
                      ? "border-clear bg-clear-soft text-clear"
                      : "border-line bg-surface-raised text-ink"
                  }`}
                  onClick={() => onChange({ ...answer, value: true })}
                >
                  Aman / cocok
                </button>
                <button
                  type="button"
                  className={`tap-target rounded-[6px] border text-sm font-medium ${
                    value === false
                      ? "border-critical bg-critical-soft text-critical"
                      : "border-line bg-surface-raised text-ink"
                  }`}
                  onClick={() => onChange({ ...answer, value: false })}
                >
                  Bermasalah
                </button>
              </div>
            )}

            {item.input_type === "scale" && (
              <div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = value === n;
                    const tone =
                      n <= 2
                        ? "border-critical bg-critical-soft text-critical"
                        : n === 3
                          ? "border-caution bg-caution-soft text-caution"
                          : "border-clear bg-clear-soft text-clear";
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-label={SCALE_LABELS[n - 1]}
                        className={`tap-target rounded-[6px] border font-data text-sm font-semibold ${
                          active ? tone : "border-line bg-surface-raised text-ink"
                        }`}
                        onClick={() => onChange({ ...answer, value: n })}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  1 buruk — 5 baik sekali
                  {typeof value === "number" ? ` · ${SCALE_LABELS[value - 1]}` : ""}
                </p>
              </div>
            )}

            {item.input_type === "text" && (
              <textarea
                rows={3}
                value={typeof value === "string" ? value : ""}
                placeholder="Catat temuan singkat…"
                className="w-full rounded-[6px] border border-line bg-surface-raised px-3 py-3 text-sm text-ink"
                onChange={(e) =>
                  onChange({ ...answer, value: e.target.value })
                }
              />
            )}

            {(item.wajib_foto || item.input_type === "photo") && (
              <div className="mt-3">
                <label className="tap-target flex cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-line bg-surface px-3 text-sm text-ink-muted hover:border-brand/50 hover:text-ink">
                  {answer?.photoDataUrl ? "Ganti foto" : "Ambil / unggah foto"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
                  />
                </label>
                {answer?.photoDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={answer.photoDataUrl}
                    alt={`Foto ${item.label}`}
                    className="mt-2 max-h-40 w-full rounded-[6px] border border-line object-cover"
                  />
                )}
              </div>
            )}

            <label className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(answer?.flaggedIrrelevant)}
                onChange={(e) =>
                  onChange({ ...answer, value: answer?.value ?? null, flaggedIrrelevant: e.target.checked })
                }
              />
              Item ini tidak relevan untuk mobil ini
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
