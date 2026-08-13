import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function HomePage() {
  return (
    <AppShell>
      <section className="animate-rise relative overflow-hidden rounded-[10px] border border-line bg-surface-raised px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(14,110,100,0.08) 0%, transparent 42%), repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(216,220,218,0.35) 12px, rgba(216,220,218,0.35) 13px)",
          }}
        />
        <div className="relative">
          <p className="font-display text-sm font-semibold tracking-[0.04em] text-brand">
            CekMobil
          </p>
          <h1 className="font-display mt-3 max-w-xl text-[2rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[2.45rem]">
            Cek 3 risiko besar sebelum bayar mobil bekas.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
            Checklist terstruktur untuk pembeli awam: banjir, bekas tabrak, dokumen,
            odometer, plus penyakit khas model. Hasilnya jadi keputusan — go, hati-hati, atau batalkan.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pilih"
              className="tap-target inline-flex items-center justify-center rounded-[6px] bg-brand px-5 text-sm font-medium text-white hover:bg-brand-deep"
            >
              Mulai inspeksi
            </Link>
            <Link
              href="/riwayat"
              className="tap-target inline-flex items-center justify-center rounded-[6px] border border-line bg-surface px-5 text-sm font-medium text-ink hover:bg-brand-soft/50"
            >
              Lihat riwayat
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-rise delay-1 mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">
          Dirancang untuk dipakai di lokasi mobil
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Satu pekerjaan per langkah. Tombol besar. Panduan cara cek singkat.
        </p>
        <ol className="mt-5 space-y-3">
          {[
            {
              n: "01",
              t: "Pilih merk, model, tahun",
              d: "Pakai shortlist model terlaris pasar bekas Indonesia.",
            },
            {
              n: "02",
              t: "Isi checklist di lokasi",
              d: "Tier A terverifikasi + penyakit khas model (beta) bila ada.",
            },
            {
              n: "03",
              t: "Baca verdict & bagikan",
              d: "Stempel go / hati-hati / no-go, poin nego, tautan untuk keluarga.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-[8px] border border-line bg-surface-raised px-4 py-4"
            >
              <span className="font-data text-sm text-brand">{step.n}</span>
              <div>
                <p className="font-medium text-ink">{step.t}</p>
                <p className="mt-1 text-sm text-ink-muted">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="animate-rise delay-2 mt-8 rounded-[8px] border border-line bg-brand-soft/40 px-4 py-4 text-sm leading-relaxed text-ink-muted">
        <p className="font-medium text-ink">Gratis untuk checklist dasar</p>
        <p className="mt-1">
          Report lengkap (rekomendasi + poin nego + share link) bisa dibuka setelah
          unlock — sekitar harga kopi, jauh di bawah risiko salah beli.
        </p>
      </section>
    </AppShell>
  );
}
