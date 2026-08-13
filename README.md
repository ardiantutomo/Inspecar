# CekMobil

Aplikasi inspeksi mobil bekas untuk pembeli awam di Indonesia.

Dibangun dari:

- `prd.md` — rencana produk end-to-end
- `checklist-tier-a-universal.json` — checklist universal (Tier A)
- `prompt-desain-ui-anti-slop.md` — arah desain “Diagnostic Report”
- `prompt-generate-checklist-tier-b.md` — pola generate penyakit khas model (Tier B)

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Persistensi lokal: `localStorage`
- Share link: API route + file JSON di `data/shares/`

Dipilih supaya development cepat, mobile-first, dan bisa langsung dipakai tanpa setup database.

## Fitur MVP

1. Pilih merk → model → tahun (katalog ~40 model terlaris)
2. Checklist dinamis dari schema JSON (Tier A + sample Tier B beta)
3. Input boolean / skala 1–5 / teks + foto (kamera HP)
4. Progress per section, bisa loncat antar bagian
5. Verdict stempel: **Layak dilanjutkan / Hati-hati / Sebaiknya batalkan**
6. Freemium: checklist gratis, report lengkap + share link (simulasi bayar Rp 29rb)
7. Riwayat inspeksi di perangkat

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Catatan

- Tier B di-seed untuk beberapa model populer (Avanza, Brio, Xpander, HR-V, Innova). Model lain tetap dapat Tier A penuh.
- Prompt 2-pass untuk generate Tier B ada di `prompt-generate-checklist-tier-b.md` — siap dihubungkan ke LLM API kemudian.
- Report adalah alat bantu keputusan, bukan jaminan kondisi kendaraan.
