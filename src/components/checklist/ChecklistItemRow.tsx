"use client";

import type { ChecklistItem, ItemAnswer } from "@/lib/types";
import { StatusChips } from "@/components/ui/StatusChips";
import { PhotoUpload } from "@/components/checklist/PhotoUpload";
import { BetaBadge, SeverityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function ChecklistItemRow({
  item,
  answer,
  onChange,
}: {
  item: ChecklistItem;
  answer: ItemAnswer;
  onChange: (next: ItemAnswer) => void;
}) {
  const isBermasalah = answer.status === "bermasalah";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border bg-[var(--surface-raised)] p-4 transition-colors",
        isBermasalah ? "border-[var(--critical)]" : "border-[var(--line)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-[var(--ink)]">{item.label}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <SeverityBadge severity={item.severity} />
          {item.tier === "B" && <BetaBadge />}
        </div>
      </div>

      <details className="mt-1 text-sm text-[var(--ink-soft)]">
        <summary className="cursor-pointer select-none py-1 font-medium text-[var(--brand-ink)]">
          Cara cek &amp; tanda bahaya
        </summary>
        <div className="mt-2 space-y-2 pl-1">
          <p>
            <span className="font-semibold text-[var(--ink)]">Cara cek: </span>
            {item.cara_cek}
          </p>
          <p>
            <span className="font-semibold text-[var(--ink)]">Tanda bahaya: </span>
            {item.tanda_bahaya}
          </p>
          <p className="font-data text-xs">
            <span className="font-sans font-semibold text-[var(--ink)]">Estimasi biaya bila bermasalah: </span>
            {item.estimasi_biaya_perbaikan}
          </p>
          {item.tier === "B" && item.catatan_verifikasi && (
            <p className="text-xs italic">Catatan: {item.catatan_verifikasi}</p>
          )}
        </div>
      </details>

      <div className="mt-3">
        <StatusChips name={item.id} value={answer.status} onChange={(status) => onChange({ ...answer, status })} />
      </div>

      {item.input_type === "text" && (
        <div className="mt-3">
          <input
            type="text"
            value={answer.note ?? ""}
            onChange={(e) => onChange({ ...answer, note: e.target.value })}
            placeholder={item.id === "odo_kewajaran" ? "Contoh: 82.500 km" : "Catatan hasil cek…"}
            className="tap-target font-data w-full max-w-xs rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] placeholder:text-[var(--line-strong)] focus:border-[var(--brand)]"
          />
        </div>
      )}

      {item.input_type !== "text" && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer select-none text-[var(--ink-soft)]">+ Tambah catatan</summary>
          <textarea
            value={answer.note ?? ""}
            onChange={(e) => onChange({ ...answer, note: e.target.value })}
            rows={2}
            placeholder="Catatan tambahan (opsional)…"
            className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--line-strong)] focus:border-[var(--brand)]"
          />
        </details>
      )}

      {(item.wajib_foto || answer.photoUrl) && (
        <div className="mt-3">
          <PhotoUpload value={answer.photoUrl} onChange={(photoUrl) => onChange({ ...answer, photoUrl })} required={item.wajib_foto} />
        </div>
      )}
    </div>
  );
}
