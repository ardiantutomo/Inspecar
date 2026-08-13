import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-surface">
      <Header />

      <main className="mx-auto max-w-lg px-4 pb-8">
        <section className="pt-6">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
            Inspeksi mobil bekas
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">
            Cek mobil sebelum kamu bayar ratusan juta
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            Checklist terstruktur untuk pembeli awam: dokumen, banjir, bekas tabrak,
            mesin, transmisi — langkah demi langkah saat kamu lihat mobil.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink">Yang akan kamu cek</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/75">
              <li className="flex gap-2">
                <span className="font-mono text-critical">●</span>
                Dokumen & legalitas (rangka, mesin, BPKB)
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-critical">●</span>
                Tanda bekas banjir & tabrak berat
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-caution">●</span>
                Mesin, transmisi, odometer, kaki-kaki
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-caution">●</span>
                Test drive & kelistrikan
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-ink/80">
            <span className="font-medium text-brand">Gratis.</span> Checklist dasar
            tidak perlu akun. Hasil bisa dibagikan ke keluarga untuk diskusi.
          </div>
        </section>

        <div className="mt-8">
          <Link href="/mulai" className="btn-primary w-full">
            Mulai inspeksi
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-ink/45">
          Alat bantu keputusan, bukan jaminan kondisi. Untuk keputusan akhir,
          pertimbangkan pemeriksaan bengkel terpercaya.
        </p>
      </main>
    </div>
  );
}
