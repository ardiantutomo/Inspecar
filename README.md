# PeriksaMobil — Aplikasi Inspeksi Mobil Bekas

Implementasi MVP dari 4 dokumen perencanaan di repo ini:

| Dokumen | Peran | Implementasinya |
|---|---|---|
| `prd.md` | Rencana produk end-to-end | Alur pilih mobil → checklist dinamis → verdict → share link (`app/src/pages`) |
| `checklist-tier-a-universal.json` | Checklist universal Tier A | Di-render sebagai dynamic form (`app/src/data/checklist-tier-a-universal.json`) |
| `prompt-desain-ui-anti-slop.md` | Design brief "Diagnostic Report" | Token desain di `app/src/index.css`, kartu Verdict sebagai signature element |
| `prompt-generate-checklist-tier-b.md` | Prompt pack penyakit per model | Prompt 2 tahap di `app/src/lib/tierBPrompts.ts` + template Tier B cached di `app/src/data/tierB.ts` |

## Menjalankan

```bash
cd app
npm install
npm run dev      # development
npm run build    # produksi (hasil statis di app/dist)
```

## Tech stack

- **Vite + React + TypeScript** — development cepat, hasil build statis (bisa dihosting di mana saja: Vercel/Netlify/GitHub Pages).
- **Tailwind CSS v4** — token desain tunggal (warna severity, mono untuk angka) di `src/index.css`.
- **react-router (HashRouter)** — routing tanpa konfigurasi server.
- **localStorage** — inspeksi & foto tersimpan di perangkat; belum butuh backend.
- **lz-string** — share link report: hasil inspeksi dikompresi ke dalam URL, penerima bisa membuka tanpa akun/backend.

## Apa yang sudah jalan (Fase 1 MVP)

- Katalog ±36 model terlaris (merk → model → rentang tahun) + input manual untuk model di luar katalog.
- Checklist Tier A universal (26+ item): dokumen, banjir, tabrak/rangka, mesin, transmisi, odometer, kaki-kaki, kelistrikan, test drive. Tiap item punya cara cek, tanda bahaya, estimasi biaya, dan triase Aman / Ragu / Bermasalah.
- Section Tier B "penyakit khas model" berlabel **beta** untuk model yang punya template cached (Avanza/Xenia, Jazz GD3, Grand Livina, Innova, Xpander) — mengikuti pola generate-once → cache → serve.
- Foto wajib pada item major visual (dikompresi di klien, tersimpan lokal).
- Verdict deterministik dari input terstruktur (bukan teks bebas): **Layak dipertimbangkan / Periksa lebih lanjut / Tidak disarankan**, plus daftar temuan serius, item yang perlu dipastikan, dan bahan nego.
- Share link report (tanpa foto) + disclaimer di semua report.
- Mobile-first: tap target besar, tombol aksi sticky, aman untuk dipakai satu tangan di lokasi.

## Belum diimplementasikan (sesuai phasing PRD)

- Auth, pembayaran report (freemium), ekspor PDF.
- Feedback loop "tidak relevan" / suggest-missing + algoritma demote (Fase 2) — struktur datanya sudah disiapkan lewat versioning template.
- Generate Tier B on-demand via LLM API — prompt & alurnya sudah siap di `app/src/lib/tierBPrompts.ts`; tinggal disambungkan ke API + pipeline validasi.
