# Periksa Dulu — Inspeksi Mobil Bekas

Implementasi MVP dari rencana produk di [`docs/prd.md`](docs/prd.md): aplikasi yang membantu pembeli mobil bekas
individu mengambil keputusan (go / hati-hati / no-go) lewat checklist inspeksi terstruktur, sebelum mereka bayar.

Dibangun dengan stack yang cepat untuk dikembangkan solo dan tetap production-friendly:

- **Next.js 16** (App Router, Turbopack, TypeScript) — satu framework untuk halaman + API.
- **Tailwind CSS v4** — styling lewat design token (lihat `src/app/globals.css`), sesuai brief di
  [`docs/prompt-desain-ui-anti-slop.md`](docs/prompt-desain-ui-anti-slop.md).
- **Prisma + SQLite** — database lokal tanpa perlu setup server database terpisah; mudah diganti ke Postgres di
  produksi (cukup ganti `datasource.provider` & `DATABASE_URL`).
- **jose + cookie httpOnly** — sesi login ringan tanpa dependensi auth provider eksternal.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env   # lalu isi SESSION_SECRET dengan string acak yang panjang
npx prisma migrate dev # sekali saja, membuat prisma/dev.db
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur penting

```
docs/                        # 4 dokumen rencana asli (PRD, checklist Tier A, prompt desain, prompt Tier B)
src/data/tier-a-universal.json         # checklist universal (Tier A) — sumber kebenaran, dipakai untuk semua kendaraan
src/data/tier-b/*.json                 # contoh checklist penyakit spesifik model (Tier B, beta) — lihat catatan di bawah
src/lib/catalog.ts            # katalog kendaraan (shortlist ~25 model terlaris, sesuai Keputusan #1 di PRD)
src/lib/template.ts           # menggabungkan Tier A + Tier B jadi satu template per kendaraan (generate-once -> cache)
src/lib/verdict.ts            # aturan skor go/hati-hati/no-go dari jawaban checklist
src/components/checklist/     # form checklist dinamis (dirender dari schema, bukan hardcoded per kendaraan)
src/components/report/        # kartu Verdict + laporan lengkap (gated di balik "unlock")
src/app/api/                  # auth, CRUD inspeksi, unlock (mock bayar), share link, upload foto
```

## Alur produk yang sudah jalan (Fase 1 / MVP di PRD §10)

1. Daftar/masuk (auth individu, cookie session).
2. Pilih merk → model → tahun dari katalog.
3. Isi checklist yang dikelompokkan per section, dengan panduan "cara cek" & "tanda bahaya" per item, rating
   3-status (Aman / Perlu perhatian / Bermasalah), catatan teks, dan upload foto untuk item major yang visual.
4. Lihat hasil: kartu **Verdict** (go / hati-hati / no-go) dengan ringkasan & disclaimer — ini yang selalu gratis.
5. **Laporan lengkap** (rincian tiap temuan, estimasi biaya, foto) berada di balik tombol "unlock" — model freemium
   sesuai Keputusan #2 di PRD.
6. **Bagikan hasil** menghasilkan link publik read-only (`/laporan/[token]`) — diprioritaskan sebelum ekspor PDF,
   sesuai Keputusan #6.
7. Riwayat inspeksi tersimpan per akun di `/akun`.

## Catatan jujur tentang penyederhanaan (dan kenapa)

Lingkungan pengembangan ini tidak menyediakan API key LLM maupun payment gateway, jadi beberapa bagian di PRD
disederhanakan secara sengaja supaya seluruh alur tetap bisa dicoba end-to-end:

- **Tier B (penyakit spesifik model)** di PRD dihasilkan lewat pipeline 2-tahap LLM (generate → kritik) — lihat
  [`docs/prompt-generate-checklist-tier-b.md`](docs/prompt-generate-checklist-tier-b.md). Di sini, `src/data/tier-b/*.json`
  diisi manual untuk beberapa model populer (Avanza, Xenia, Brio, Kijang Innova) sebagai contoh nyata mekanismenya
  (label "beta", `confidence`, `catatan_verifikasi`, section terpisah). Model lain hanya mendapat Tier A. Untuk
  mengaktifkan pipeline asli: panggil LLM sesuai prompt tersebut, validasi schema, lalu simpan hasilnya ke
  `src/data/tier-b/` (atau ke tabel `ChecklistTemplate` di database bila ingin generate-on-demand).
- **Rating jawaban disederhanakan jadi 3-status universal** (Aman / Perlu perhatian / Bermasalah) untuk semua
  `input_type`, alih-alih boolean per item yang polaritasnya (true = baik/buruk) berbeda-beda antar item di schema
  asli. Ini justru lebih ramah dipakai satu tangan di lapangan, dan skor go/hati-hati/no-go jadi konsisten tanpa
  perlu anotasi polaritas manual per item.
- **Verdict dihitung dengan aturan deterministik** (`src/lib/verdict.ts`) alih-alih narasi LLM, karena tidak ada
  akses API LLM di lingkungan ini. PRD §6.5 tetap mengizinkan ini selama input tetap terstruktur (bukan teks bebas)
  dan disclaimer tetap tampil — itu sudah diikuti.
- **Katalog kendaraan** memuat ~25 model terlaris (statis), belum ada "generate on-demand" untuk model di luar
  daftar (butuh LLM). Placeholder pesan sudah ada di halaman pilih merk.
- **Unlock laporan lengkap ("bayar")** adalah tombol demo yang langsung membuka akses — belum terhubung payment
  gateway sungguhan (butuh kredensial/API key yang tidak tersedia di sini). Ganti `src/app/api/inspeksi/[id]/unlock/route.ts`
  dengan verifikasi callback payment gateway sebelum production.
- **Upload foto** disimpan ke `public/uploads/` di disk lokal untuk kesederhanaan demo. Untuk production, pindahkan
  ke object storage (S3-compatible) agar tidak hilang saat redeploy.
- **Feedback loop crowd-sourced** (flag "tidak relevan", algoritma demote/hide di PRD §6) belum diimplementasikan —
  itu memang dijadwalkan Fase 2 di PRD §10, bukan bagian MVP Fase 1.

Semua penyederhanaan ini didesain agar mudah diganti tanpa merombak arsitektur: schema checklist, tipe data, dan
struktur versioning template sudah mengikuti kontrak di `docs/prd.md` §5.
