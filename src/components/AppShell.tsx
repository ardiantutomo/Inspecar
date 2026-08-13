import Link from "next/link";

export function AppShell({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {!bare && (
        <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] bg-brand text-[11px] font-semibold tracking-wide text-white"
              >
                CM
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
                CekMobil
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/pilih"
                className="tap-target inline-flex items-center px-3 text-ink-muted transition-colors hover:text-ink"
              >
                Mulai
              </Link>
              <Link
                href="/riwayat"
                className="tap-target inline-flex items-center px-3 text-ink-muted transition-colors hover:text-ink"
              >
                Riwayat
              </Link>
            </nav>
          </div>
        </header>
      )}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
    </div>
  );
}
