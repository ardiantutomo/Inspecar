# Design Brief Prompt — Anti "AI Slop" untuk UI Aplikasi Inspeksi Kendaraan

> Paste blok "PROMPT" di bawah ke Cursor agent saat membangun/merombak UI.
> Kenapa panjang & spesifik? Karena instruksi "jangan bikin AI slop" saja **tidak berguna** — tanpa arah, agent jatuh ke default (yang justru = slop). Yang bikin UI tidak generik adalah **sudut pandang spesifik untuk produk ini**, bukan larangan.

---

## Inti masalahnya

AI slop di UI punya "tell" yang khas dan langsung kelihatan:
- Background cream hangat + serif kontras tinggi + aksen terracotta (ini malah warna khas interaksi Claude — di brief-mu justru makin ketahuan AI)
- Background near-black + satu aksen hijau-acid/vermilion
- Gradient ungu→biru, sudut membulat seragam di semua elemen, emoji bertebaran, spacing default, ilustrasi generik
- Copy yang menjual ("Empower your journey!") alih-alih menjelaskan

Prompt di bawah menghindari itu dengan **mengunci subjek** dan memberi **satu arah desain yang beralasan**, bukan sekadar daftar "jangan".

---

## PROMPT (paste ke Cursor)

```
You are the design lead at a small studio known for giving every product a visual
identity that could not be mistaken for anyone else's. Build this UI as a
deliberate, opinionated design for THIS specific brief — not a generic template.

=== SUBJECT (locked — design for exactly this) ===
Product: aplikasi inspeksi mobil bekas untuk pembeli awam di Indonesia.
Audience: orang biasa yang mau beli mobil bekas seharga ratusan juta dan TAKUT
  ketipu (banjir, bekas tabrak, KM diputar, dokumen bermasalah). Bukan montir.
The one job of the UI: mengubah rasa cemas jadi keputusan yang percaya diri.
Emotional core: trust, ketelitian, transparansi. The product is the calm, precise
  second opinion the buyer wishes they had.

=== DESIGN DIRECTION (follow this; it's grounded in the subject) ===
Concept: "Diagnostic Report" — terasa seperti instrumen diagnostik yang presisi
  BERTEMU sertifikat inspeksi yang bisa dipercaya. Bukan aplikasi lifestyle,
  bukan SaaS ceria. Tenang, teliti, faktual.

Signature element (spend your boldness HERE, keep everything else quiet):
  Kartu "Verdict" — hasil rekomendasi go / hati-hati / no-go yang ditampilkan
  seperti hasil diagnosa/stempel inspeksi resmi. Ini elemen yang paling diingat
  user. Semua elemen lain dibuat disiplin & tenang di sekelilingnya.

Severity as information, not decoration: aplikasi ini punya sistem major/minor.
  Perlakukan color-coding severity seperti sistem triase medis — konsisten dan
  bermakna, JANGAN dipakai buat menghias. Warna hanya muncul untuk mengkodekan
  tingkat keparahan temuan.

=== TOKEN SYSTEM (starting point — refine, but don't drift into the defaults) ===
Palette (4-6 hex, functional):
  --ink:      #16191C   (teks utama, near-charcoal teknis — BUKAN cream+serif look)
  --surface:  #F6F7F6   (paper bersih & cool, kesan lembar inspeksi — bukan cream hangat)
  --line:     #D8DCDA   (hairline, garis pemisah presisi)
  --brand:    #0E6E64   (petrol/teal presisi — sinyal ketelitian; BUKAN SaaS-blue/ungu)
  Severity (dipakai HANYA untuk tingkat temuan):
  --critical: #B23B32   (merah serius, bukan neon)
  --caution:  #C08420   (amber)
  --clear:    #2E7D52   (hijau "aman/terverifikasi")

Type (deliberate pairing, hindari serif-kontras-tinggi default):
  - Display/heading: grotesque teknis yang presisi (mis. kelas Söhne/Neue Haas/
    Inter Display dipakai dengan restraint) — bukan serif dramatis.
  - Body: sans humanis yang sangat terbaca di ukuran kecil (report padat info).
  - Data/angka: typeface MONOSPACE / tabular figures untuk KM, harga, nomor
    rangka/mesin, estimasi biaya. Angka rata & sejajar = terasa seperti instrumen
    ukur. Ini bagian dari signature, bukan sekadar font.

Layout:
  - Bukan hero "angka besar + gradient". Hero = ketenangan & kejelasan: nyatakan
    apa yang app ini lakukan untuk si pembeli, langsung.
  - Struktur seperti lembar inspeksi: section major/minor jelas terpisah,
    hierarki tegas, whitespace disiplin.
  - Numbering hanya kalau memang urutan nyata (mis. alur inspeksi bertahap),
    jangan 01/02/03 dekoratif.

=== HARD "DON'T" (AI-slop tells) ===
- JANGAN pakai: background cream hangat + serif kontras tinggi + aksen terracotta.
- JANGAN pakai: gradient ungu→biru, glassmorphism generik, drop-shadow tebal
  di mana-mana, sudut membulat seragam di semua elemen.
- JANGAN taruh emoji sebagai ikon fitur.
- JANGAN pakai ilustrasi 3D/blob generik.
- Animasi seperlunya saja — animasi berlebihan justru terasa AI-generated.

=== QUALITY FLOOR (wajib, tanpa diumumkan) ===
- Responsif sampai mobile (mayoritas user akan buka dari HP saat lihat mobil).
- Focus state keyboard terlihat; kontras warna cukup (WCAG AA).
- Hormati prefers-reduced-motion.
- Tap target cukup besar (dipakai sambil berdiri di dekat mobil, satu tangan).

=== COPY (setengah dari kesan slop ada di sini) ===
- Tulis dari sisi pengguna. Sebut hal dengan yang mereka kenali ("Kondisi mesin"),
  bukan istilah sistem.
- Deskriptif & spesifik, bukan menjual. "Cek 3 titik ini sebelum bayar", bukan
  "Wujudkan mobil impianmu!".
- Tombol menyatakan aksinya: "Mulai inspeksi", "Lihat hasil" — konsisten dari
  tombol sampai notifikasi.
- Empty state & error = arahan, bukan basa-basi. Error menjelaskan apa yang salah
  dan cara membetulkannya, tanpa minta maaf berlebihan.
- Semua copy Bahasa Indonesia, sentence case, tanpa filler.

=== PROCESS (lakukan sebelum nulis banyak kode) ===
1. Susun rencana token singkat (color, type, layout, signature) untuk brief ini.
2. Uji ke diri sendiri: "Kalau brief lain yang mirip, apakah aku sampai ke desain
   yang sama?" Kalau ya, bagian itu = default. Ganti, dan sebutkan apa yang diubah
   & kenapa.
3. Baru tulis kode mengikuti rencana yang sudah direvisi.
4. Kritik lagi hasilnya (screenshot bila bisa). Prinsip Chanel: sebelum keluar,
   lepas satu aksesori — buang satu dekorasi yang tidak melayani brief.
```

---

## Cara pakai

- **Jangan** kirim prompt ini tiap komponen kecil. Kirim sekali di awal saat menata **fondasi visual / design system**, biar token (warna, type, spacing) konsisten. Setelah itu, minta agent "ikuti design system yang sudah ada" untuk komponen berikutnya.
- **Arah "Diagnostic Report" & token di atas adalah usulan, bukan wajib.** Kalau kamu punya selera lain, ganti bagian DIRECTION & TOKEN — yang penting *ada* sudut pandang spesifik, bukan default. Justru itu inti anti-slop-nya.
- **Simpan token final sebagai satu file** (mis. CSS variables / Tailwind config). Sumber kebenaran tunggal bikin seluruh app konsisten dan menjauh dari tampilan "tiap halaman beda tangan".

---

*Catatan: arah "severity sebagai informasi" nyambung langsung dengan struktur checklist (major/minor/add-on) di rencana — jadi sistem warnamu punya makna nyata, bukan hiasan. Itu salah satu pembeda terkuat dari UI generik.*
