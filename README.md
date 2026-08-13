# CekMobil

Aplikasi inspeksi mobil bekas untuk pembeli awam di Indonesia. MVP berdasarkan PRD dan checklist Tier A universal.

## Tech stack

- **Next.js 15** + **TypeScript** + **Tailwind CSS**
- Mobile-first, tap target 48px, design system "Diagnostic Report"
- Data checklist dari `checklist-tier-a-universal.json`
- Penyimpanan lokal (localStorage) + share link

## Fitur MVP

- Pilih kendaraan (~30 model populer)
- Checklist dinamis Tier A (dokumen, banjir, tabrak, mesin, transmisi, dll.)
- Input boolean / skala / teks + foto wajib untuk item visual
- Verdict go / hati-hati / tidak disarankan
- Salin link laporan untuk dibagikan

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Struktur

- `prd.md` — rencana produk
- `checklist-tier-a-universal.json` — schema checklist universal
- `prompt-desain-ui-anti-slop.md` — brief desain UI
- `prompt-generate-checklist-tier-b.md` — prompt generate Tier B (belum diimplementasi)

## Roadmap (dari PRD)

- [ ] Auth individu
- [ ] Tier B (penyakit per model) via LLM generate-once
- [ ] Feedback "tidak relevan" + suggest missing
- [ ] Pembayaran report lengkap
- [ ] Ekspor PDF
