# Periksa Dulu — aplikasi inspeksi mobil bekas

Implementasi dari dokumen rencana di `docs/`: aplikasi yang membantu **pembeli
mobil bekas awam di Indonesia** memeriksa unit incarannya lewat checklist
terstruktur, lalu mengubah hasilnya jadi putusan (layak / hati-hati / batal),
perkiraan biaya perbaikan, dan bahan negosiasi.

Sumber acuan:

| Dokumen | Isi |
|---|---|
| `docs/prd.md` | rencana produk & teknis (dua tier checklist, feedback loop, freemium, phasing) |
| `docs/prompt-desain-ui-anti-slop.md` | brief desain UI ("Diagnostic Report") |
| `docs/prompt-generate-checklist-tier-b.md` | prompt pack 2-pass untuk penyakit per model |
| `docs/design-system.md` | token final + alasan keputusan desain (ditulis saat implementasi) |
| `src/data/checklist-tier-a-universal.json` | checklist universal Tier A, sumber kebenaran tunggal |

## Tech stack

Dipilih supaya satu orang bisa mengembangkan cepat tanpa infrastruktur tambahan:

- **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS v4** — token desain didefinisikan sekali di `src/app/globals.css`
- **Prisma 7 + SQLite** (driver adapter `better-sqlite3`) — satu file database,
  tinggal ganti `datasource` ke Postgres saat produksi
- **zod** untuk validasi form dan validasi keras output LLM
- **sharp** untuk resize + strip metadata foto dari HP
- Auth sendiri (scrypt + cookie sesi httpOnly), tanpa dependensi tambahan
- LLM opsional lewat endpoint apa pun yang kompatibel OpenAI Chat Completions

## Menjalankan

```bash
npm install
cp .env.example .env      # semua nilai sudah punya default yang jalan
npm run setup             # prisma generate + db push + seed data demo
npm run dev               # http://localhost:3000
```

Akun hasil seed:

| Email | Kata sandi | Untuk |
|---|---|---|
| `demo@contoh.id` | `rahasia123` | akun pembeli, sudah punya 1 inspeksi selesai + report terbuka |
| `admin@contoh.id` | `rahasia123` | akses halaman kurasi `/kurasi` |

Script lain: `npm run build`, `npm run lint`, `npm run typecheck`,
`npm run db:studio`, `npm run kurasi:demote -- --dry`.

## Yang sudah jalan

**Fase 1 (MVP B2C) — lengkap**

- Auth individu (daftar, masuk, sesi cookie 30 hari)
- Katalog ~50 model terlaris + entri manual untuk model di luar daftar
- Checklist Tier A universal (9 bagian, 26 pemeriksaan) di-render dari schema JSON
- Tier B (penyakit per model) via LLM 2-pass, ditandai **beta**, otomatis dilewati
  kalau `LLM_API_KEY` kosong
- Form dinamis mobile-first: cara cek + tanda bahaya per item, autosave, foto
  langsung dari kamera, item matic/manual difilter otomatis
- Putusan + perkiraan biaya + bahan nego dihitung **deterministik** dari jawaban
- Freemium: checklist gratis, report lengkap berbayar (mode mock tanpa gateway)
- Share link publik + gaya cetak untuk disimpan sebagai PDF

**Fase 2 (loop kualitas) — sudah ada fondasinya**

- Hitungan `impressions` per item (sekali per inspeksi per bagian)
- Tandai "tidak relevan" + usulan pemeriksaan baru
- Algoritma demote/hide §6.2 + halaman kurasi + jejak audit + versioning template

**Belum dikerjakan (sesuai phasing):** akun institusi, subscription, analisis foto
multimodal, trust weighting, integrasi e-Samsat (sengaja diganti langkah cek
mandiri, lihat PRD §9 keputusan 5).

## Keputusan implementasi yang perlu diketahui

**1. Putusan tidak pernah dihitung LLM.** `src/lib/scoring/score.ts` memetakan
jawaban → berat temuan → verdict dengan aturan tetap. LLM hanya menyusun narasi
dari hasil yang sudah dihitung (PRD §6.5), dan kalau tidak ada API key narasinya
disusun generator berbasis aturan. Report jadi bisa direproduksi.

**2. Tiga field tambahan pada schema checklist.** Kontrak di PRD §5 tidak cukup
untuk menilai jawaban secara deterministik, jadi item bisa punya:

- `polaritas` (`ya_aman` / `ya_bahaya`) — untuk item boolean, menandai jawaban
  mana yang berarti aman. Tanpa ini, "Nomor rangka cocok" dan "Bekas las pada
  rangka" tidak bisa dinilai dengan aturan yang sama.
- `deal_breaker` — temuan yang langsung membatalkan rekomendasi.
- `berlaku_transmisi` — item yang hanya relevan untuk matic atau manual.

Prompt Tier B ikut diperbarui supaya LLM mengisi `polaritas`.

**3. Semua jawaban punya satu bentuk internal.** Tiap pemeriksaan menghasilkan
`aman` / `perhatian` / `bahaya` / `tidak_dicek`, sedangkan `input_type` hanya
menentukan data tambahan yang diminta (angka, catatan, foto). Ini yang membuat
satu mesin penilaian bisa melayani semua jenis item.

**4. Biaya dibaca dari teks template.** `src/lib/scoring/rupiah.ts` mengurai
"Rp 500rb - 3jt" jadi angka. Temuan `perhatian` dihitung separuh rentang, temuan
`bahaya` dihitung penuh. String yang memang tidak bisa diangkakan (mis.
"Deal-breaker (batalkan)") tetap ditampilkan apa adanya dan **dilaporkan sebagai
"tidak terukur"**, bukan disembunyikan dari total.

**5. Versioning dipegang teguh.** Inspeksi menyimpan `templateKey` +
`templateVersion`. Demote otomatis selalu membuat versi baru dan mengarsipkan yang
lama, jadi report yang sudah dibagikan tidak pernah berubah isinya.

**6. Foto tidak pernah jadi file publik.** Disajikan lewat `/api/foto/[id]` yang
memeriksa pemilik sesi, atau token share link untuk report yang sudah dibuka.
Sebelum disimpan, foto di-resize ke maks 1600px dan metadata (termasuk lokasi)
dibuang.

## Menyiapkan produksi

1. **Database.** Ganti `datasource db { provider = "sqlite" }` di
   `prisma/schema.prisma` ke `postgresql`, pasang `@prisma/adapter-pg`, sesuaikan
   `src/lib/db.ts`, lalu `prisma migrate deploy`.
2. **SESSION_SECRET.** Wajib diisi (`openssl rand -hex 32`); app menolak jalan di
   produksi tanpa itu.
3. **Penyimpanan foto.** `DATA_DIR` menulis ke filesystem lokal, jadi butuh disk
   yang persisten (VPS/container volume). Untuk platform serverless, ganti isi
   `src/lib/photos.ts` ke object storage — antarmukanya sudah terpisah.
4. **Payment.** `PAYMENT_MODE=mock` hanya untuk uji alur. Integrasi sungguhan
   cukup mengubah `src/app/actions/bayar.ts` (buat transaksi + webhook yang
   mengisi `Inspection.paidAt`); pengecekan hak akses report tidak perlu berubah.
5. **LLM.** Isi `LLM_API_KEY` untuk mengaktifkan Tier B dan narasi AI. Tanpa itu
   app tetap berfungsi penuh.
6. **Demote otomatis.** Jadwalkan `npm run kurasi:demote` (mis. cron harian).
