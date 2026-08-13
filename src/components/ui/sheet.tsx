import type { ReactNode } from "react";

/** Wadah dasar: "lembar" berhairline, radius 2px, tanpa shadow. */
export function Sheet({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  return (
    <Tag
      className={`sheet rounded-sheet border border-line bg-sheet ${className}`}
    >
      {children}
    </Tag>
  );
}

export function MicroLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`micro-label ${className}`}>{children}</span>;
}

/** Baris data label/nilai. Nilai selalu mono tabular. */
export function DataRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <MicroLabel>{label}</MicroLabel>
      <span
        className={`text-right text-sm text-ink ${mono ? "data-num" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function Page({
  children,
  className = "",
  width = "narrow",
}: {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "wide";
}) {
  const max = width === "narrow" ? "max-w-2xl" : "max-w-5xl";
  return (
    <div className={`mx-auto w-full ${max} px-4 py-6 sm:py-10 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lead,
  meta,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  meta?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {eyebrow && <MicroLabel className="block">{eyebrow}</MicroLabel>}
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
      {lead && <p className="mt-3 max-w-xl text-ink-soft">{lead}</p>}
      {meta && <div className="mt-4">{meta}</div>}
    </div>
  );
}
