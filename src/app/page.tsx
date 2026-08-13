import Link from "next/link";
import { ShieldCheck, FileWarning, Droplets, Gauge } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";

const TIER_A_POINTS = [
  {
    icon: Droplets,
    title: "Tanda bekas banjir",
    body: "Lumpur tersembunyi, bau lembab, korosi kabel — hal yang sering disembunyikan penjual.",
  },
  {
    icon: FileWarning,
    title: "Dokumen & legalitas",
    body: "Kecocokan nomor rangka & mesin, status BPKB, pajak — sebelum kamu tertarik ke kondisi fisik.",
  },
  {
    icon: Gauge,
    title: "Mesin, transmisi & odometer",
    body: "Indikator umum yang bisa dicek siapa saja tanpa alat bengkel.",
  },
  {
    icon: ShieldCheck,
    title: "Bekas tabrak & rangka",
    body: "Kelurusan bodi, bekas las, cat ulang — indikasi kecelakaan berat yang ditutupi.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <Container className="py-14 sm:py-20">
          <p className="font-data text-xs uppercase tracking-wide text-[var(--brand-ink)]">Untuk pembeli mobil bekas individu</p>
          <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
            Cek dulu sebelum bayar. Bukan setelah menyesal.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--ink-soft)] sm:text-base">
            Checklist inspeksi terstruktur yang menuntunmu memeriksa titik-titik krusial — bekas banjir, bekas
            tabrak, dokumen, mesin — lalu memberi rekomendasi jelas: lanjut, hati-hati, atau batalkan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href={user ? "/mulai" : "/daftar"} size="lg">
              Mulai inspeksi
            </LinkButton>
            <LinkButton href="/masuk" variant="secondary" size="lg">
              Saya sudah punya akun
            </LinkButton>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <h2 className="font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">
            Checklist universal — berlaku untuk semua mobil bekas
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink-soft)]">
            Bagian ini yang paling bisa dipegang: sudah ditinjau dan berlaku untuk semua merk/model. Penyakit
            spesifik per model ditandai jelas sebagai <span className="font-medium text-[var(--ink)]">beta</span>{" "}
            karena masih dibangun dari feedback pengguna.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {TIER_A_POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
                <Icon className="h-5 w-5 text-[var(--brand)]" strokeWidth={1.75} />
                <h3 className="mt-3 font-display font-semibold text-[var(--ink)]">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--surface-raised)] py-14 sm:py-20">
        <Container>
          <h2 className="font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">Bagaimana cara kerjanya</h2>
          <ol className="mt-6 space-y-5">
            <li className="flex gap-4">
              <span className="font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] text-sm text-[var(--ink-soft)]">
                1
              </span>
              <p className="text-sm leading-relaxed text-[var(--ink)]">
                Pilih merk, model, dan tahun mobil yang ingin diperiksa.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] text-sm text-[var(--ink-soft)]">
                2
              </span>
              <p className="text-sm leading-relaxed text-[var(--ink)]">
                Ikuti checklist saat melihat mobil langsung — tiap item ada panduan cara cek & tanda bahaya.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] text-sm text-[var(--ink-soft)]">
                3
              </span>
              <p className="text-sm leading-relaxed text-[var(--ink)]">
                Dapatkan rekomendasi go/hati-hati/no-go, lalu bagikan hasilnya lewat link ke keluarga atau untuk nego.
              </p>
            </li>
          </ol>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="text-center">
          <h2 className="font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">Checklist dasar selalu gratis</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
            Bayar hanya bila ingin laporan lengkap: rincian tiap temuan, estimasi biaya perbaikan, dan poin negosiasi.
          </p>
          <div className="mt-6">
            <LinkButton href={user ? "/mulai" : "/daftar"} size="lg">
              Mulai sekarang
            </LinkButton>
          </div>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            Sudah punya laporan?{" "}
            <Link href="/masuk" className="font-medium text-[var(--brand-ink)] underline underline-offset-2">
              Masuk ke akunmu
            </Link>
          </p>
        </Container>
      </section>
    </div>
  );
}
