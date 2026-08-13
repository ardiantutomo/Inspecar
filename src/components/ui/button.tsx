import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "utama" | "garis" | "sunyi" | "bahaya";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sheet border text-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55";

// Target sentuh minimum 44px: dipakai satu tangan sambil berdiri di dekat mobil.
const SIZES: Record<Size, string> = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-13 px-5 py-3 text-base",
};

const VARIANTS: Record<Variant, string> = {
  utama: "border-brand bg-brand text-sheet hover:bg-brand-ink",
  garis: "border-line-strong bg-sheet text-ink hover:border-ink",
  sunyi: "border-transparent bg-transparent text-ink-soft hover:text-ink",
  bahaya: "border-critical bg-sheet text-critical hover:bg-critical hover:text-sheet",
};

export function buttonClass(variant: Variant = "utama", size: Size = "md"): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}`;
}

export function Button({
  variant = "utama",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button className={`${buttonClass(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "utama",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link className={`${buttonClass(variant, size)} ${className}`} {...props}>
      {children}
    </Link>
  );
}
