"use client";

import { cn } from "@/lib/cn";
import type { AnswerStatus } from "@/lib/types";

const OPTIONS: Array<{ value: AnswerStatus; label: string; activeClass: string }> = [
  { value: "aman", label: "Aman", activeClass: "bg-[var(--clear-soft)] border-[var(--clear)] text-[var(--clear)]" },
  {
    value: "perhatian",
    label: "Perlu perhatian",
    activeClass: "bg-[var(--caution-soft)] border-[var(--caution)] text-[var(--caution)]",
  },
  {
    value: "bermasalah",
    label: "Bermasalah",
    activeClass: "bg-[var(--critical-soft)] border-[var(--critical)] text-[var(--critical)]",
  },
];

export function StatusChips({
  value,
  onChange,
  name,
}: {
  value?: AnswerStatus;
  onChange: (value: AnswerStatus) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label="Status temuan" className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            name={name}
            onClick={() => onChange(opt.value)}
            className={cn(
              "tap-target rounded-[var(--radius-sm)] border px-3.5 text-sm font-medium transition-colors",
              active ? opt.activeClass : "border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--ink-soft)] hover:border-[var(--brand)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
