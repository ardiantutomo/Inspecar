# Rencana Aplikasi Inspeksi Kendaraan (End-to-End)

> Dokumen perencanaan produk & teknis. Disusun dari hasil diskusi.
> Status: draft v2 — keputusan §11 sudah difinalisasi. Disesuaikan dengan kondisi resource: **hanya LLM/AI API** (tanpa tim kurasi, tanpa dataset eksternal).
> Fokus: **bisa langsung dipakai end user (pembeli mobil bekas individu).**

---

## 1. Ringkasan & Positioning

Aplikasi inspeksi kendaraan yang membantu **pembeli mobil bekas mengambil keputusan** (go / no-go / nego), dengan checklist terstruktur disertai catatan "penyakit" khas tiap model.

**Realita moat (penting):** karena resource saat ini hanya LLM API, moat **belum dimiliki saat launch** — ia **ditumbuhkan** dari feedback user seiring waktu. Maka kekuatan produk di hari pertama harus bertumpu pada bagian yang LLM andal + pengalaman yang mulus, **bukan** pada kelengkapan penyakit per model (justru area LLM paling lemah).

**Prinsip kunci:** pisahkan checklist jadi **dua tingkat keandalan** (lihat §4). LLM menyemai, feedback user membangun akurasi (§6).

---

## 2. Target Pengguna & Model Bisnis

**Launch fokus B2C (individu).** Institusi & subscription ditunda ke fase berikutnya.

| Tipe | Deskripsi | Monetisasi | Peran |
|------|-----------|------------|-------|
| **End user (individu)** | Pembeli mobil bekas awam | **Freemium**: checklist dasar gratis, bayar untuk **report + rekomendasi lengkap** | Fokus utama saat launch |
| **Institusi** (fase lanjut) | Showroom, rental, leasing, auction, asuransi | Subscription + kuota kendaraan & seats | Recurring revenue — fase berikutnya |

**Model harga (hipotesis, wajib divalidasi ke user nyata):**
- Checklist dasar: **gratis** (turunkan hambatan; masalah terbesar adalah *kepercayaan & awareness*, bukan harga)
- Report lengkap (summary go/no-go + estimasi biaya + share link/PDF): **~Rp 25rb–50rb per report** — receh dibanding mobil 100–200jt, tapi cukup menyaring yang serius
- Angka ini titik awal untuk diuji, bukan keputusan final.

---

## 3. Fitur Inti

### 3.1 Auth
- Register / login (individu). Struktur akun institusi disiapkan tapi tidak diaktifkan saat launch.

### 3.2 Pemilihan Kendaraan
- Katalog **merk → model → tahun/varian**. Lihat §7 (strategi katalog).

### 3.3 Checklist Dinamis (Dua Tier — lihat §4)
- Form di-*render* dari **schema JSON** (§5)
- Dikelompokkan per **severity**: major / minor / add-on / optional
- Tiap item: cara cek, tanda bahaya, input, foto, estimasi biaya perbaikan
- Upload foto pada item major yang visual (§ Keputusan 4)

### 3.4 Penyimpanan Data & Report
- Tiap inspeksi tersimpan (`Inspection`) mereferensikan **versi template**
- Report mereproduksi kondisi & versi checklist saat inspeksi

### 3.5 Summary & Rekomendasi
- Dari hasil checklist terstruktur → ringkasan kondisi + rekomendasi (go / no-go / poin nego)
- LLM hanya diberi **input terstruktur**, bukan teks bebas (§6-narasi)
- **Wajib disclaimer** (saran keputusan finansial → mitigasi liability)

---

## 4. Strategi Checklist: Dua Tier Keandalan + Generate-Once → Cache

Karena LLM gampang berhalusinasi tepat di area paling kritis (penyakit per model), checklist dipisah:

### Tier A — Checklist Universal ✅ (tulang punggung saat launch)
Berlaku untuk semua mobil bekas, area di mana LLM **andal** dan paling berguna buat pembeli awam:
- Tanda **bekas banjir**
- **Bekas tabrak berat / rangka**
- **Mesin & transmisi** (indikator umum)
- **Dokumen** (kecocokan rangka-mesin, status kredit/blokir)
- **Odometer / kewajaran KM**
- Kaki-kaki, kelistrikan, interior — level umum

Tier A disajikan sebagai **fakta yang bisa dipegang**. Ini yang bikin produk sudah berguna di hari pertama.

### Tier B — Penyakit Spesifik per Model ⚠️ (label "beta / belum terverifikasi")
Area LLM paling lemah. **Jangan** disajikan seolah fakta ke orang yang mau keluar ratusan juta.
- Ditandai jelas sebagai belum terverifikasi
- Dibangun & dimurnikan lewat feedback user (§6)
- Boleh pakai LLM web-grounded bila API mendukung

### Alur teknis (berlaku untuk keduanya): Generate-Once → Cache → Serve

```
User pilih merk+model+tahun
        │
        ▼
Template ada di DB? ──ya──►  Sajikan versi cached (instan, konsisten)
        │ tidak
        ▼
LLM generate DRAFT (schema JSON ketat)  ── 2 tahap: generate → LLM kritik & buang yang tidak yakin
        │
        ▼
Simpan sbg template (Tier A: active; Tier B: beta)
        │
        ▼
Semua user dapat versi sama (cached, versioned)
```

**Tidak** memanggil LLM live tiap klik (inkonsistensi, latency, biaya). Generate sekali, simpan, sajikan cached.

---

## 5. Kontrak Schema JSON (Dynamic Form)

LLM **wajib** menghasilkan output persis struktur ini; frontend me-*render* dari sini. Template **di-versioning**.

```json
{
  "template_id": "toyota-avanza-2012-2015",
  "brand": "Toyota",
  "model": "Avanza",
  "year_range": "2012-2015",
  "version": 3,
  "tier": "A",                       // A = universal (verified) | B = model-specific (beta)
  "status": "published",
  "sections": [
    {
      "severity": "major",
      "title": "Mesin & Transmisi",
      "items": [
        {
          "id": "eng_oil_leak",
          "label": "Kebocoran oli mesin",
          "cara_cek": "Lihat kolong mesin & area gasket. Cek noda oli basah/menetes.",
          "tanda_bahaya": "Rembes basah, tetesan, oli bercampur air (emulsi).",
          "severity": "major",
          "input_type": "scale",       // boolean | scale | text | photo
          "wajib_foto": true,
          "estimasi_biaya_perbaikan": "Rp 500rb - 3jt",
          "status": "active"           // active | optional | hidden
        }
      ]
    }
  ]
}
```

**Aturan versioning:**
- Setiap perubahan template → naikkan `version`
- `Inspection` menyimpan `template_id` + `version`
- Report lama **selalu** mereproduksi versi saat inspeksi (jangan mutasi template lama secara destruktif)

---

## 6. Feedback Relevansi User → Self-Improving Checklist

Mesin utama perbaikan kualitas (terutama Tier B). Mengubah kelemahan LLM jadi perbaikan data.

### 6.1 Sinyal per `(template_id, version, item_id)`
- `impressions` — berapa kali item tampil
- `flag_irrelevant` — berapa kali ditandai tidak relevan
- `suggested_missing` — usulan item/penyakit yang belum ada (umpan positif)

### 6.2 Draf Algoritma Demote / Hide
`irrelevance_rate = flag_irrelevant / impressions`

| Kondisi | Aksi |
|---------|------|
| `impressions < 30` | Tidak ada aksi otomatis (sampel belum cukup) |
| `rate ≥ 40%` dan `impressions ≥ 30` | Pindah ke section **Optional** (collapsed) + antre review |
| `rate ≥ 60%` dan `impressions ≥ 50` | **Hidden by default** + antre review prioritas |

**Aturan wajib:**
- **Jangan pernah auto-delete.** Otomatis hanya *demote* (active → optional → hidden). Hapus permanen = keputusan manusia.
- Tiap perubahan status → bump version + audit trail.

### 6.3 (Opsional) Trust Weighting
Bobot flag inspektor terverifikasi > user anonim (mencegah spam menggeser checklist). Relevan saat institusi aktif.

### 6.4 Loop Positif
`suggested_missing` yang sering diusulkan → naik antrean untuk ditambahkan. Checklist tumbuh menangkap penyakit asli yang LLM lewatkan → memperkuat moat dari waktu ke waktu.

### 6.5 Narasi Summary
LLM boleh menyusun narasi rekomendasi, tapi **hanya diberi hasil checklist terstruktur** (skor/severity per item), bukan teks bebas. Selalu sertakan disclaimer.

---

## 7. Data Model (Konsep)

- **User** — individu (struktur institusi disiapkan, nonaktif saat launch)
- **Institution** *(fase lanjut)* — `max_kendaraan`, `max_seats`, status langganan
- **Vehicle** — identitas mobil (merk, model, tahun, plat/rangka bila ada)
- **Inspection** — satu event; referensi `Vehicle`, `User`, `template_id`, `template_version`, jawaban, foto, timestamp
- **ChecklistTemplate** — *versioned*, kunci `brand + model + year_range`; punya `tier` (A/B)
- **ChecklistItemFeedback** — agregasi impressions/flags (algoritma §6)
- **Payment** — one-off report (payment gateway). Subscription menyusul.

---

## 8. Pertimbangan Khusus Pasar Indonesia

Inti Tier A "bantu keputusan":
- **Bekas banjir** — cek karat tersembunyi, jamur, jalur kabel, bau
- **Bekas tabrak berat / rangka** — kelurusan bodi, celah panel, bekas las
- **Odometer diputar** — keausan vs klaim KM
- **Dokumen** — STNK/BPKB, kecocokan nomor rangka & mesin, status kredit/blokir/sitaan
- **Pajak** — dipandu cek mandiri (lihat Keputusan 5)

**Batasan data:** tidak ada Carfax lokal. Jangan janjikan riwayat kendaraan penuh; pakai yang realistis.

---

## 9. Keputusan Final (menggantikan pertanyaan terbuka)

**1. Katalog kendaraan — shortlist dulu, tumbuh on-demand.**
Jangan kejar "selengkap mungkin" (luas tapi dangkal = jebakan). Mulai dari **~30–50 model terlaris** yang menutup ~80% pasar bekas ID (Avanza, Xenia, Innova, Brio, Ertiga, HR-V, Rush, Terios, dst). Katalog di-*seed* sekali via LLM (risiko rendah: sekadar daftar). Kalau user cari model yang belum ada → generate on-demand saat itu. Scraping/beli dataset ditunda.

**2. Harga — freemium, B2C dulu.**
Checklist dasar **gratis**; bayar untuk **report + rekomendasi lengkap** (~Rp 25rb–50rb/report, hipotesis). Hambatan terbesar = kepercayaan & awareness, bukan harga. Subscription/institusi = fase lanjut.

**3. Kurasi — LLM (dengan teknik) + review ringan sendiri + crowd.**
- LLM 2 tahap: generate → minta LLM kritik & buang yang tidak yakin; instruksi eksplisit *"hanya isu yang benar-benar terdokumentasi; kalau ragu, jangan"*. Pakai web-grounded untuk Tier B bila tersedia.
- Review ringan sendiri untuk ~30–50 template awal (beberapa menit/model, sanggup solo).
- Crowd (algoritma §6) sebagai mesin perbaikan utama, terutama Tier B.

**4. Foto — wajib hanya untuk sedikit item major yang visual.**
Jaga friksi rendah. Wajib foto di: **tanda banjir/karat, bodi/bekas tabrak, dashboard+odometer, nomor rangka/mesin**. Sisanya opsional. (Foto ini fondasi untuk analisis LLM multimodal di masa depan — jangan diwajibkan sekarang.)

**5. Integrasi eksternal (pajak/e-Samsat) — skip di MVP.**
e-Samsat per-provinsi, terfragmentasi, sering tanpa API bersih → terlalu berat untuk solo/LLM-only. Ganti dengan **langkah checklist yang menuntun user cek sendiri** (+ tautan Samsat resmi). Nol effort integrasi, nilai tetap didapat.

**6. Format report — share link dulu, PDF menyusul.**
Pembeli pasti mau tunjukkan hasil ke keluarga / pakai buat nego → **share link** jadi prioritas (sekaligus bikin app menyebar). **Ekspor PDF** ditambahkan setelahnya.

---

## 10. Rencana Bertahap (Phasing)

**Fase 1 — MVP B2C (siap dipakai end user)**
- Auth individu
- Katalog ~30–50 model (seed via LLM) + generate on-demand
- **Tier A checklist** (verified) dari template cached — inti nilai saat launch
- **Tier B** tampil dengan label beta
- Upload foto item major visual
- Summary + rekomendasi + disclaimer
- Freemium: dasar gratis, report berbayar
- **Share link** report

**Fase 2 — Feedback Loop & Kualitas**
- Flag "tidak relevan" + suggest missing
- Algoritma demote/hide (§6) + dashboard kurasi ringan
- Versioning penuh + reproduksi report
- Ekspor PDF

**Fase 3 — Institusi**
- Akun institusi, seats, kuota, role
- Subscription billing
- Dashboard institusi

**Fase 4 — Perluasan**
- Tambah cakupan model, analisis foto LLM multimodal, trust weighting, integrasi lanjutan

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Halusinasi LLM di penyakit per model | Dua tier (A verified / B beta) + generate 2-tahap + feedback user |
| Moat belum ada saat launch | Bertumpu pada Tier A + pengalaman mulus; moat ditumbuhkan via §6 |
| Frekuensi B2C rendah | Freemium turunkan hambatan; share link bikin menyebar; institusi = fase lanjut |
| Liability atas saran beli | Disclaimer jelas; posisikan alat bantu, bukan jaminan |
| Report tak konsisten | Template versioned + serve cached, bukan generate live |
| Tidak ada Carfax lokal | Jangan janjikan riwayat penuh; pandu cek mandiri (Samsat) |

---

*Framing jujur: dengan LLM-only, kekuatan saat launch = Tier A yang solid + UX mulus. Moat model-spesifik ditumbuhkan, bukan dimiliki di hari pertama. Dengan framing ini, produk tetap sangat bisa dipakai end user langsung sejak awal.*
