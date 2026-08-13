import Link from "next/link";
import { History, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/LogoutButton";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface-raised)]">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-[var(--ink)]">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border-2 border-[var(--brand)] font-data text-xs font-bold text-[var(--brand)]"
          >
            OK
          </span>
          Periksa Dulu
        </Link>

        {user ? (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/akun"
              aria-label="Riwayat inspeksi"
              className="tap-target flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)] sm:px-2.5"
            >
              <History className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="hidden sm:inline">Riwayat inspeksi</span>
            </Link>
            <LinkButton href="/mulai" variant="secondary" size="md" className="!px-3 sm:!px-4">
              <Plus className="h-4 w-4 sm:hidden" strokeWidth={2} />
              <span className="hidden sm:inline">Mulai inspeksi</span>
            </LinkButton>
            <LogoutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <LinkButton href="/masuk" variant="ghost" size="md">
              Masuk
            </LinkButton>
            <LinkButton href="/daftar" variant="primary" size="md">
              Daftar
            </LinkButton>
          </nav>
        )}
      </Container>
    </header>
  );
}
