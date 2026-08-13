"use client";

import { ChecklistItem, ItemAnswer } from "@/types/checklist";
import { SeverityBadge } from "./SeverityBadge";

interface ChecklistItemFormProps {
  item: ChecklistItem;
  answer?: ItemAnswer;
  index: number;
  onChange: (answer: ItemAnswer) => void;
}

export function ChecklistItemForm({ item, answer, index, onChange }: ChecklistItemFormProps) {
  const value = answer?.value;
  const photoDataUrl = answer?.photoDataUrl;

  const update = (partial: Partial<ItemAnswer>) => {
    onChange({
      itemId: item.id,
      value: partial.value !== undefined ? partial.value : (value ?? null),
      photoDataUrl: partial.photoDataUrl !== undefined ? partial.photoDataUrl : photoDataUrl,
      flagged: partial.flagged !== undefined ? partial.flagged : answer?.flagged,
    });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ photoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const sectionClass =
    item.severity === "major" ? "severity-major" : "severity-minor";

  return (
    <article
      className={`card p-4 ${sectionClass}`}
      aria-labelledby={`item-${item.id}-label`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-ink/40">#{index + 1}</p>
          <h3 id={`item-${item.id}-label`} className="mt-0.5 text-base font-medium text-ink">
            {item.label}
          </h3>
        </div>
        <SeverityBadge severity={item.severity} />
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-sm font-medium text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          Cara cek
        </summary>
        <div className="mt-2 space-y-2 text-sm text-ink/75">
          <p>{item.cara_cek}</p>
          <p className="rounded border border-critical/20 bg-critical/5 px-3 py-2 text-critical">
            <span className="font-medium">Tanda bahaya: </span>
            {item.tanda_bahaya}
          </p>
          <p className="font-mono text-xs text-ink/50">
            Estimasi biaya: {item.estimasi_biaya_perbaikan}
          </p>
        </div>
      </details>

      <div className="mt-4">
        {item.input_type === "boolean" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update({ value: true })}
              className={`min-h-[48px] flex-1 rounded-lg border text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                value === true
                  ? "border-clear bg-clear/10 text-clear"
                  : "border-line bg-white text-ink hover:bg-surface"
              }`}
            >
              OK / Tidak bermasalah
            </button>
            <button
              type="button"
              onClick={() => update({ value: false })}
              className={`min-h-[48px] flex-1 rounded-lg border text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                value === false
                  ? "border-critical bg-critical/10 text-critical"
                  : "border-line bg-white text-ink hover:bg-surface"
              }`}
            >
              Ada masalah
            </button>
          </div>
        )}

        {item.input_type === "scale" && (
          <div>
            <p className="mb-2 text-sm text-ink/60">Skala 1 (buruk) – 5 (baik)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ value: n })}
                  className={`min-h-[48px] min-w-[48px] flex-1 rounded-lg border font-mono text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    value === n
                      ? n <= 2
                        ? "border-critical bg-critical/10 text-critical"
                        : n >= 4
                          ? "border-clear bg-clear/10 text-clear"
                          : "border-caution bg-caution/10 text-caution"
                      : "border-line bg-white text-ink hover:bg-surface"
                  }`}
                  aria-label={`Skor ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.input_type === "text" && (
          <textarea
            className="input-field min-h-[96px] resize-y"
            placeholder="Catat temuan (mis. status pajak, KM, dll.)"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => update({ value: e.target.value })}
            rows={3}
          />
        )}

        {(item.wajib_foto || item.input_type === "photo") && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-ink">
              Foto{item.wajib_foto ? " (wajib)" : " (opsional)"}
            </label>
            {photoDataUrl ? (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoDataUrl}
                  alt={`Foto ${item.label}`}
                  className="max-h-40 rounded-lg border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => update({ photoDataUrl: undefined })}
                  className="mt-2 text-sm text-critical underline"
                >
                  Hapus foto
                </button>
              </div>
            ) : (
              <label className="mt-2 flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-surface px-4 text-sm text-ink/70 hover:border-brand hover:text-brand">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhoto}
                />
                Ambil / unggah foto
              </label>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
