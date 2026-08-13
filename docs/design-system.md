# Design system — "Diagnostic Report"

Sumber kebenaran token: `src/app/globals.css` (blok `@theme`). Dokumen ini menjelaskan
keputusannya supaya komponen baru tidak melenceng.

## Rencana token

**Konsep.** Lembar inspeksi resmi yang ditulis instrumen presisi. Tenang, teliti,
faktual. Bukan SaaS ceria, bukan lifestyle app.

**Warna** (fungsional, 7 nilai — dari brief `docs/prompt-desain-ui-anti-slop.md`):

| Token | Hex | Dipakai untuk |
|---|---|---|
| `--color-ink` | `#16191C` | teks utama, garis tebal, stempel verdict |
| `--color-ink-soft` | `#565D63` | teks sekunder, keterangan |
| `--color-surface` | `#F6F7F6` | latar halaman (kertas cool, bukan cream hangat) |
| `--color-sheet` | `#FFFFFF` | latar lembar/kartu |
| `--color-line` | `#D8DCDA` | hairline pemisah |
| `--color-brand` | `#0E6E64` | aksi utama, penanda ketelitian |
| `--color-critical` | `#B23B32` | **hanya** temuan berat |
| `--color-caution` | `#C08420` | **hanya** temuan perlu perhatian |
| `--color-clear` | `#2E7D52` | **hanya** hasil aman/terverifikasi |

Tiga warna severity bekerja seperti triase: dipakai untuk mengkodekan tingkat
temuan, tidak pernah untuk menghias. Tidak ada elemen dekoratif berwarna di app.

**Tipografi.**

- Display/heading: `Archivo` — grotesque teknis, agak sempit, tegas pada ukuran
  kecil. Dipakai dengan `letter-spacing` negatif tipis.
- Body: `Inter` — sangat terbaca pada 14–16px, penting karena report padat info.
- Data: `IBM Plex Mono` + `font-variant-numeric: tabular-nums` untuk KM, harga,
  estimasi biaya, nomor rangka/mesin, ID inspeksi, versi template. Angka yang
  sejajar adalah bagian dari identitas, bukan sekadar pilihan font.
- Micro-label: mono, uppercase, 11px, `letter-spacing: .08em` — meniru label
  kolom pada formulir inspeksi.

**Layout.**

- Radius 2px (`--radius-sheet`). Tajam, seperti kertas dan alat ukur — sekaligus
  menolak "semua sudut membulat seragam".
- Hairline 1px sebagai pemisah utama. Nyaris tanpa shadow; shadow hanya pada
  action bar melayang di mobile karena memang perlu dibedakan dari isi.
- Struktur lembar: header data kendaraan berupa grid label/nilai, lalu section
  major/minor terpisah tegas.
- Rail severity: garis 3px di sisi kiri item, bukan pil berwarna di mana-mana.

**Signature element.** Kartu **Verdict**: bingkai hairline ganda, kata putusan
dalam mono uppercase berspasi lebar, sudut bertanda seperti stempel, dan baris
metadata mono di bawahnya (ID inspeksi, versi template, waktu). Semua elemen lain
dibuat tenang agar kartu ini yang diingat.

## Uji "apakah ini default?"

Yang akan keluar kalau tidak dilawan: kartu `rounded-2xl` + shadow lembut, hero
gradient dengan angka besar, badge pil berwarna untuk segala hal, ikon emoji,
ilustrasi blob. Yang diubah dan alasannya:

1. **Radius 16px → 2px.** Bentuk lembut menandakan produk konsumtif; ini alat
   pemeriksaan.
2. **Shadow → hairline.** Kedalaman palsu digantikan garis pembagi seperti pada
   formulir cetak.
3. **Badge berwarna → rail + teks.** Warna jadi informasi (severity), bukan
   dekorasi; sekaligus lebih ramah kontras.
4. **Hero gradient → header lembar.** Halaman depan langsung menyatakan apa yang
   dikerjakan app untuk pembeli, tanpa bahasa jualan.
5. **Angka proporsional → mono tabular.** Harga dan KM berjajar rapi; terasa
   seperti hasil ukur.
6. **Ikon emoji → tidak ada ikon dekoratif.** Yang tersisa hanya glyph fungsional
   (centang, silang) yang digambar dengan `currentColor`.

Satu dekorasi yang dilepas di akhir (prinsip "lepas satu aksesori"): tanda sudut
stempel awalnya dipakai juga pada semua kartu section — dikembalikan hanya untuk
kartu Verdict supaya tetap istimewa.

## Lantai kualitas

- Mobile dulu: satu kolom sampai 640px, target sentuh minimal 44×44px, kontrol
  utama dalam jangkauan jempol (action bar bawah).
- Fokus keyboard terlihat di semua kontrol (`:focus-visible`, outline 2px).
- Kontras teks memenuhi WCAG AA pada semua kombinasi token di atas.
- `prefers-reduced-motion` dihormati; transisi memang minim.
- Gaya cetak (`@media print`) tersedia agar report bisa disimpan sebagai PDF.
