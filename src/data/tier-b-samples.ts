import type { ChecklistItem } from "@/lib/types";

/** Sample Tier B (beta) — penyakit khas model. Generate-once cache untuk demo. */
export const TIER_B_BY_MODEL: Record<string, ChecklistItem[]> = {
  "toyota-avanza-2012-2015": [
    {
      id: "b_avanza_vvt_i_noise",
      label: "Bunyi ketukan mesin (rantai keteng / VVT-i)",
      cara_cek:
        "Nyalakan mesin dingin, dengarkan dari ruang mesin 10–20 detik pertama. Bandingkan dengan suara mesin Avanza sehat bila sempat.",
      tanda_bahaya:
        "Bunyi 'ktok-ktok' metalik saat dingin yang tidak hilang setelah panas, atau bunyi makin keras saat akselerasi.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 2jt - 8jt",
      status: "beta",
      confidence: "high",
      catatan_verifikasi:
        "Generasi 1500cc lama sering dilaporkan isu timing chain/VVT di komunitas bengkel LCGC/MPV.",
    },
    {
      id: "b_avanza_ac_evaporator",
      label: "AC kurang dingin / evaporator bocor",
      cara_cek:
        "Nyalakan AC maksimal 2 menit. Cek hembusan tiap mode & bau apek dari vent.",
      tanda_bahaya:
        "Dingin sebentar lalu lemah, bau apek, atau freon sering diisi ulang menurut penjual.",
      severity: "minor",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 1jt - 3,5jt",
      status: "beta",
      confidence: "high",
      catatan_verifikasi:
        "Evaporator Avanza gen2 sering jadi keluhan di bengkel AC Indonesia.",
    },
    {
      id: "b_avanza_rear_shock",
      label: "Shock belakang lemah (muatan)",
      cara_cek:
        "Tekan bagasi beberapa kali. Saat test drive isi 3–4 penumpang, rasakan limbung di belokan.",
      tanda_bahaya: "Bagasi bergoyang lama, limbung saat belok dengan penumpang.",
      severity: "minor",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 800rb - 2jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "MPV keluarga sering dipakai angkut; shock belakang cepat aus pada unit tua.",
    },
  ],
  "toyota-avanza-2015-2019": [
    {
      id: "b_avanza15_cvt_jerk",
      label: "Transmisi (jika matic) hentakan / jeda",
      cara_cek:
        "Test drive di jalan sepi: stop-and-go, gas pelan lalu gas sedang. Rasakan perpindahan.",
      tanda_bahaya: "Hentakan, RPM naik tanpa tarikan, atau getaran saat gigi rendah.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 5jt - 20jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "Unit matic generasi ini sering jadi fokus inspeksi karena biaya perbaikan transmisi tinggi.",
    },
    {
      id: "b_avanza15_waterpump",
      label: "Kebocoran water pump / coolant",
      cara_cek:
        "Cek level air radiator saat mesin dingin. Lihat area pompa air & selang bawah.",
      tanda_bahaya: "Noda coolant hijau/merah di kolong, level turun tanpa alasan jelas.",
      severity: "major",
      input_type: "boolean",
      wajib_foto: true,
      estimasi_biaya_perbaikan: "Rp 800rb - 2,5jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "Kebocoran cooling system relatif sering dilaporkan pada unit dengan KM tinggi.",
    },
  ],
  "honda-brio-2018-2023": [
    {
      id: "b_brio_cvt_whine",
      label: "Suara dengung transmisi CVT",
      cara_cek:
        "Saat jalan konstan 40–60 km/jam, matikan audio. Dengarkan dengung dari area transmisi.",
      tanda_bahaya:
        "Dengung keras yang naik ikut kecepatan, atau hentakan saat tip-in gas.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 8jt - 25jt",
      status: "beta",
      confidence: "high",
      catatan_verifikasi:
        "CVT Brio/Mobilio sering jadi topik di komunitas Honda; perawatan oli CVT krusial.",
    },
    {
      id: "b_brio_ac_cooling",
      label: "Performa AC di macet",
      cara_cek:
        "Nyalakan AC saat idle di tempat teduh 3 menit, lalu bandingkan saat jalan.",
      tanda_bahaya: "Hanya dingin saat jalan, hangat saat berhenti — indikasi kondensor/kipas.",
      severity: "minor",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 500rb - 2jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "City car kecil sering dikeluhkan AC kurang optimal di kemacetan tropis.",
    },
  ],
  "mitsubishi-xpander-2017-2021": [
    {
      id: "b_xpander_idle_rough",
      label: "Idle kasar / RPM tidak stabil",
      cara_cek:
        "Biarkan mesin idle AC nyala & mati. Pantau jarum RPM dan getaran kabin.",
      tanda_bahaya: "RPM naik-turun sendiri, getaran berlebih, atau mesin hampir mati.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 500rb - 4jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "Beberapa unit awal Xpander dilaporkan isu idle/throttle body di bengkel umum.",
    },
    {
      id: "b_xpander_door_align",
      label: "Celah pintu / sliding (bila ada keluhan bodi)",
      cara_cek:
        "Buka-tutup semua pintu, periksa celah & suara 'klik' engsel. Cek kesimetrisan.",
      tanda_bahaya: "Pintu seret, celah tidak rata, atau bunyi engsel abnormal.",
      severity: "minor",
      input_type: "scale",
      wajib_foto: true,
      estimasi_biaya_perbaikan: "Rp 200rb - 1,5jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "MPV sering dipakai keluarga; engsel & alignment pintu jadi titik cek praktis.",
    },
  ],
  "honda-hrv-2015-2018": [
    {
      id: "b_hrv_cvt",
      label: "Gejala CVT (hentakan / dengung)",
      cara_cek:
        "Test drive stop-and-go dan tanjakan ringan. Dengarkan dengung, rasakan slip.",
      tanda_bahaya: "Slip, dengung, atau bau gosong dari area transmisi.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 10jt - 30jt",
      status: "beta",
      confidence: "high",
      catatan_verifikasi:
        "HR-V gen1 dengan CVT sering masuk daftar inspeksi transmisi di pasar bekas.",
    },
  ],
  "toyota-innova-2016-2020": [
    {
      id: "b_innova_diesel_glow",
      label: "Start dingin diesel (bila varian diesel)",
      cara_cek:
        "Pastikan mesin dingin. Perhatikan lama start & asap putih awal.",
      tanda_bahaya: "Start lama berulang, asap putih tebal menetap, suara ketukan kasar.",
      severity: "major",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 2jt - 15jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "Innova diesel populer armada; glow plug & injector jadi titik rawan unit tua.",
    },
    {
      id: "b_innova_rear_leaf",
      label: "Per daun / kenyamanan belakang",
      cara_cek:
        "Isi penumpang belakang, lewati polisi tidur pelan. Rasakan pantulan & bunyi.",
      tanda_bahaya: "Pantulan keras, bunyi metalik belakang, bagasi terasa patah-patah.",
      severity: "minor",
      input_type: "scale",
      wajib_foto: false,
      estimasi_biaya_perbaikan: "Rp 1jt - 4jt",
      status: "beta",
      confidence: "medium",
      catatan_verifikasi:
        "Innova sering angkut barang; kaki belakang & bushing cepat aus.",
    },
  ],
};

export function getTierBItems(templateKey: string): ChecklistItem[] {
  return TIER_B_BY_MODEL[templateKey] ?? [];
}
