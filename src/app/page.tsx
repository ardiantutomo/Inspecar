import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MicroLabel, Sheet } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/auth";
import { tierATemplate } from "@/lib/checklist/template-service";
import { REPORT_PRICE_IDR } from "@/lib/env";
import { formatRupiah } from "@/lib/scoring/rupiah";

const LANGKAH = [
  {
    judul: "Pilih mobilnya",
    isi: "Merk, model, dan tahun. Checklist yang keluar sudah disesuaikan, termasuk item khusus matic atau manual.",
  },
  {
    judul: "Periksa sambil berdiri di dekat mobil",
    isi: "Tiap pemeriksaan ada cara ceknya dan tanda bahayanya. Jawabanmu tersimpan otomatis, boleh dilanjut nanti.",
  },
  {
    judul: "Ambil keputusan",
    isi: "Hasilnya jadi putusan layak / hati-hati / batal, perkiraan biaya perbaikan, dan daftar bahan menawar.",
  },
];

export default async function Beranda() {
  const user = await getCurrentUser();
  const template = tierATemplate();
  const jumlahItem = template.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-14">
      <section className="border-b border-line pb-10">
        <MicroLabel>Untuk pembeli mobil bekas · Indonesia</MicroLabel>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-[44px] sm:leading-[1.08]">
          Periksa dulu, sebelum uangnya pindah tangan.
        </h1>
        <p className="mt-5 max-w-xl text-[17px] text-ink-soft">
          Checklist terstruktur untuk memeriksa mobil bekas: tanda banjir, bekas
          tabrak, dokumen, mesin, sampai test drive. Kamu tinggal mengikuti
          urutannya, hasilnya jadi keputusan yang bisa dipertanggungjawabkan.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={user ? "/inspeksi/baru" : "/daftar"} size="lg">
            Mulai inspeksi
          </ButtonLink>
          {!user && (
            <ButtonLink href="/masuk" variant="garis" size="lg">
              Sudah punya akun
            </ButtonLink>
          )}
        </div>

        <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {[
            ["Pemeriksaan", String(jumlahItem)],
            ["Bagian", String(template.sections.length)],
            ["Checklist dasar", "Gratis"],
            ["Report lengkap", formatRupiah(REPORT_PRICE_IDR)],
          ].map(([label, value]) => (
            <div key={label} className="border-l-[3px] border-line pl-3">
              <dt className="micro-label">{label}</dt>
              <dd className="data-num mt-1 text-xl">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-b border-line py-10">
        <h2 className="text-xl font-semibold">Cara kerjanya</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {LANGKAH.map((langkah, index) => (
            <Sheet as="li" key={langkah.judul} className="p-4">
              <MicroLabel>Langkah {index + 1}</MicroLabel>
              <h3 className="mt-2 text-base font-semibold">{langkah.judul}</h3>
              <p className="mt-2 text-sm text-ink-soft">{langkah.isi}</p>
            </Sheet>
          ))}
        </ol>
      </section>

      <section className="border-b border-line py-10">
        <h2 className="text-xl font-semibold">Yang diperiksa</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Bagian bertanda <span className="text-ink">penting</span> adalah yang bisa
          membatalkan pembelian. Sisanya umumnya jadi bahan menawar harga.
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {template.sections.map((section) => (
            <li
              key={section.title}
              className="flex items-baseline justify-between gap-4 border-b border-line py-3"
            >
              <span className="text-[15px]">{section.title}</span>
              <span className="micro-label whitespace-nowrap">
                {section.severity === "major" ? "Penting" : "Sekunder"} ·{" "}
                {section.items.length} cek
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-10">
        <h2 className="text-xl font-semibold">Yang tidak kami janjikan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Sheet className="p-4">
            <h3 className="text-base font-semibold">Bukan riwayat kendaraan</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Di Indonesia belum ada basis data riwayat mobil yang terbuka. Kami
              tidak mengaku punya datanya; yang kami lakukan adalah menuntun kamu
              memeriksa sendiri, termasuk cek pajak dan blokir di Samsat.
            </p>
          </Sheet>
          <Sheet className="p-4">
            <h3 className="text-base font-semibold">Penyakit khas model masih beta</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Checklist universal sudah teruji dan itu yang jadi tulang punggung.
              Daftar penyakit spesifik per model ditandai beta dan diperbaiki dari
              masukan pengguna — kamu bisa menandai item yang tidak relevan.
            </p>
          </Sheet>
        </div>
        <p className="mt-6 max-w-xl text-sm text-ink-soft">
          {template.meta.disclaimer}{" "}
          <Link href="/daftar" className="font-medium text-ink underline underline-offset-4">
            Mulai dari checklist gratis
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
