import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "tap-target inline-flex items-center justify-center gap-2 rounded-[6px] px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-deep",
    secondary:
      "border border-line bg-surface-raised text-ink hover:border-brand/40 hover:bg-brand-soft/60",
    ghost: "text-ink-muted hover:bg-brand-soft/50 hover:text-ink",
    danger: "bg-critical text-white hover:bg-critical/90",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-ink"
    >
      {children}
    </label>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`tap-target w-full rounded-[6px] border border-line bg-surface-raised px-3 text-ink placeholder:text-ink-muted/70 ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`tap-target w-full rounded-[6px] border border-line bg-surface-raised px-3 text-ink ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SeverityBadge({
  severity,
}: {
  severity: "major" | "minor" | "addon" | "optional";
}) {
  const map = {
    major: "bg-critical-soft text-critical",
    minor: "bg-caution-soft text-caution",
    addon: "bg-brand-soft text-brand-deep",
    optional: "bg-surface text-ink-muted",
  };
  const label = {
    major: "Major",
    minor: "Minor",
    addon: "Add-on",
    optional: "Opsional",
  };
  return (
    <span
      className={`inline-flex rounded-[3px] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[severity]}`}
    >
      {label[severity]}
    </span>
  );
}

export function BetaBadge() {
  return (
    <span className="inline-flex rounded-[3px] border border-caution/40 bg-caution-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-caution">
      Beta
    </span>
  );
}

export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[8px] border border-line bg-surface-raised p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}
