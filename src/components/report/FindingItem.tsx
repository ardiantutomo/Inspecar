import Image from "next/image";
import type { ChecklistItem, ItemAnswer } from "@/lib/types";
import { SeverityBadge, BetaBadge } from "@/components/ui/Badge";

export function FindingItem({ item, answer }: { item: ChecklistItem; answer: ItemAnswer }) {
  return (
    <div className="border-b border-[var(--line)] py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-[var(--ink)]">{item.label}</h4>
        <div className="flex shrink-0 items-center gap-1.5">
          <SeverityBadge severity={item.severity} />
          {item.tier === "B" && <BetaBadge />}
        </div>
      </div>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.tanda_bahaya}</p>
      <p className="font-data mt-1.5 text-xs text-[var(--ink)]">
        Estimasi biaya perbaikan: <span className="font-semibold">{item.estimasi_biaya_perbaikan}</span>
      </p>
      {answer.note && <p className="mt-1.5 text-sm italic text-[var(--ink)]">Catatan: {answer.note}</p>}
      {answer.photoUrl && (
        <Image
          src={answer.photoUrl}
          alt={`Foto temuan: ${item.label}`}
          width={96}
          height={96}
          className="mt-2 h-24 w-24 rounded-[var(--radius-sm)] border border-[var(--line)] object-cover"
        />
      )}
    </div>
  );
}
