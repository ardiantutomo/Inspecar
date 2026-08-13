import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Periksa Dulu — inspeksi mobil bekas sebelum bayar",
    template: "%s — Periksa Dulu",
  },
  description:
    "Checklist terstruktur untuk memeriksa mobil bekas: banjir, bekas tabrak, dokumen, mesin. Hasilnya jadi ringkasan kondisi dan bahan negosiasi.",
};

export const viewport: Viewport = {
  themeColor: "#16191C",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="id"
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#utama"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-sheet"
        >
          Lompat ke konten
        </a>

        <header
          className="border-b border-line bg-sheet"
          data-print="hide"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="group flex flex-col leading-none">
              <span className="font-display text-[17px] font-semibold uppercase tracking-[0.14em] text-ink">
                Periksa Dulu
              </span>
              <span className="micro-label mt-1">Inspeksi mobil bekas</span>
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              {user ? (
                <>
                  <Link
                    href="/inspeksi"
                    className="px-3 py-2 font-medium text-ink underline-offset-4 hover:underline"
                  >
                    Inspeksi saya
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/kurasi"
                      className="px-3 py-2 text-ink-soft underline-offset-4 hover:underline"
                    >
                      Kurasi
                    </Link>
                  )}
                  <form action="/keluar" method="post">
                    <button
                      type="submit"
                      className="px-3 py-2 text-ink-soft underline-offset-4 hover:underline"
                    >
                      Keluar
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/masuk"
                    className="px-3 py-2 font-medium text-ink underline-offset-4 hover:underline"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    className="border border-ink bg-ink px-3 py-2 font-medium text-sheet"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main id="utama" className="flex-1">
          {children}
        </main>

        <footer className="mt-16 border-t border-line bg-sheet" data-print="hide">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">
            <p className="max-w-2xl text-sm text-ink-soft">
              Periksa Dulu adalah alat bantu keputusan, bukan jaminan kondisi
              kendaraan dan bukan pengganti pemeriksaan bengkel. Angka biaya
              adalah perkiraan kasar untuk pasar Indonesia.
            </p>
            <p className="micro-label mt-4">
              Checklist universal Tier A · penyakit per model ditandai beta
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
