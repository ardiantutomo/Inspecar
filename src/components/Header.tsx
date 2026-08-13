import Link from "next/link";

export function Header({ backHref, title }: { backHref?: string; title?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label="Kembali"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
            <span className="font-mono text-xs font-medium text-brand">CK</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title ? (
            <h1 className="truncate text-base font-semibold text-ink">{title}</h1>
          ) : (
            <span className="text-base font-semibold text-ink">CekMobil</span>
          )}
        </div>
      </div>
    </header>
  );
}
