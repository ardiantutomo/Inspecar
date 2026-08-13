import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "tap-target w-full rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3.5 text-[15px] text-[var(--ink)] placeholder:text-[var(--line-strong)] focus:border-[var(--brand)]",
          error && "border-[var(--critical)]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--critical)]">{error}</p>}
    </div>
  );
}
