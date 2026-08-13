import type { ChecklistSection } from '../types'

/**
 * Template Tier B — penyakit spesifik per model, status "beta / belum terverifikasi".
 *
 * Sesuai strategi generate-once → cache → serve (prd.md §4): template ini adalah
 * hasil kurasi yang DISIMPAN, bukan dipanggil live dari LLM tiap klik.
 * Untuk model baru, generate memakai prompt 2 tahap di lib/tierBPrompts.ts
 * (lihat prompt-generate-checklist-tier-b.md), lalu tambahkan ke daftar ini.
 *
 * Aturan seed: hanya isu yang benar-benar klasik & terdokumentasi luas di
 * komunitas/bengkel Indonesia. Kalau ragu, tidak dimasukkan (§ Pass 2).
 */

export interface TierBTemplate {
  id: string
  brand: string
  /** cocokkan dengan model (case-insensitive) */
  models: string[]
  /** year range yang tercakup; kosong = semua */
  yearRanges: string[]
  version: number
  section: ChecklistSection
}

export const TIER_B_TEMPLATES: TierBTemplate[] = [
  {
    id: 'tierb-avanza-xenia-gen12',
    brand: 'Toyota/Daihatsu',
    models: ['Avanza', 'Xenia'],
    yearRanges: ['2004-2011', '2012-2015'],
    version: 1,
    section: {
      severity: 'addon',
      tier: 'B',
      title: 'Penyakit khas Avanza / Xenia',
      deskripsi:
        'Isu yang umum dilaporkan pemilik & bengkel untuk generasi 2004-2015.',
      items: [
        {
          id: 'b_avz_rack_steer',
          label: 'Bunyi "gluduk" dari rack steer',
          cara_cek:
            'Saat test drive pelan di jalan tidak rata, dengarkan bunyi gluduk dari area setir/roda depan. Dalam kondisi diam, minta seseorang memutar setir kiri-kanan cepat sementara kamu mendengarkan dari kolong depan.',
          tanda_bahaya:
            'Bunyi gluduk/ketukan dari area setir saat lewat jalan rusak atau saat setir diputar.',
          severity: 'minor',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 500rb - 2,5jt (perbaikan/ganti rack steer)',
          status: 'beta',
          confidence: 'high',
          catatan_verifikasi:
            'Keluhan klasik Avanza-Xenia generasi awal; sangat sering dibahas komunitas & bengkel spesialis.',
        },
        {
          id: 'b_avz_kaki_depan',
          label: 'Karet & link stabilizer depan cepat aus',
          cara_cek:
            'Lewati polisi tidur pelan dan belokan; dengarkan bunyi "ktok-ktok" halus dari kaki depan. Cek riwayat servis apakah link stabilizer/bushing pernah diganti.',
          tanda_bahaya: 'Bunyi ketukan kecil berulang dari roda depan di jalan bergelombang.',
          severity: 'minor',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 300rb - 1,5jt',
          status: 'beta',
          confidence: 'medium',
          catatan_verifikasi:
            'Umum dilaporkan pemilik karena bobot MPV & pemakaian penumpang penuh; wajar jadi bahan nego.',
        },
      ],
    },
  },
  {
    id: 'tierb-jazz-gd3',
    brand: 'Honda',
    models: ['Jazz'],
    yearRanges: ['2004-2008'],
    version: 1,
    section: {
      severity: 'addon',
      tier: 'B',
      title: 'Penyakit khas Jazz GD3',
      deskripsi: 'Isu yang umum dilaporkan untuk Jazz generasi pertama (2004-2008).',
      items: [
        {
          id: 'b_jazz_cvt_judder',
          label: 'CVT bergetar / "jedug" saat mulai jalan',
          cara_cek:
            'Khusus varian matic (CVT): dari berhenti total, lepas rem dan akselerasi pelan beberapa kali. Rasakan getaran kasar atau hentakan saat mobil mulai bergerak, terutama di tanjakan.',
          tanda_bahaya:
            'Getaran/gejala "jedug" saat start dari diam. Perbaikan CVT (start clutch/overhaul) mahal.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 3jt - 15jt (servis besar/overhaul CVT)',
          status: 'beta',
          confidence: 'high',
          catatan_verifikasi:
            'Masalah start clutch CVT Jazz GD3 adalah isu paling terkenal model ini di komunitas Honda Indonesia.',
        },
      ],
    },
  },
  {
    id: 'tierb-grand-livina',
    brand: 'Nissan',
    models: ['Grand Livina'],
    yearRanges: ['2007-2013', '2013-2019'],
    version: 1,
    section: {
      severity: 'addon',
      tier: 'B',
      title: 'Penyakit khas Grand Livina',
      deskripsi: 'Isu yang umum dilaporkan pemilik Grand Livina.',
      items: [
        {
          id: 'b_livina_kaki',
          label: 'Kaki-kaki cepat bunyi (shockbreaker & karet-karet)',
          cara_cek:
            'Test drive melewati jalan bergelombang dengan muatan normal. Dengarkan bunyi jedug/gluduk dari kaki depan-belakang. Tanya riwayat penggantian shockbreaker & bushing.',
          tanda_bahaya: 'Bunyi kasar dari suspensi, bantingan terasa mengayun berlebihan.',
          severity: 'minor',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 500rb - 4jt',
          status: 'beta',
          confidence: 'high',
          catatan_verifikasi:
            'Keluhan kaki-kaki adalah penyakit Grand Livina yang paling sering dibahas komunitas & media otomotif.',
        },
      ],
    },
  },
  {
    id: 'tierb-innova-gen1',
    brand: 'Toyota',
    models: ['Kijang Innova'],
    yearRanges: ['2004-2015'],
    version: 1,
    section: {
      severity: 'addon',
      tier: 'B',
      title: 'Penyakit khas Kijang Innova (2004-2015)',
      deskripsi: 'Isu yang umum dilaporkan untuk Innova generasi pertama.',
      items: [
        {
          id: 'b_innova_ngelitik',
          label: 'Mesin bensin "ngelitik" (knocking)',
          cara_cek:
            'Khusus varian bensin: saat akselerasi di gigi tinggi RPM rendah (misal menanjak pelan), dengarkan bunyi ketukan logam halus "tik-tik-tik" dari mesin.',
          tanda_bahaya:
            'Bunyi ngelitik jelas saat akselerasi — umumnya penumpukan karbon di ruang bakar; bisa juga masalah sensor.',
          severity: 'minor',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 500rb - 3jt (purging/pembersihan karbon, tune up)',
          status: 'beta',
          confidence: 'high',
          catatan_verifikasi:
            'Ngelitik mesin 1TR/2TR Innova bensin adalah keluhan klasik yang sangat banyak dibahas komunitas Toyota.',
        },
        {
          id: 'b_innova_diesel_injector',
          label: 'Varian diesel: injector & asap',
          cara_cek:
            'Khusus varian diesel: rasakan idle — harus halus, tidak pincang. Gas mendadak dan lihat asap dari knalpot (hitam pekat berlebihan = tidak sehat). Tanya riwayat servis/kalibrasi injector.',
          tanda_bahaya: 'Idle kasar/pincang, asap hitam pekat, tarikan tersendat.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 1jt - 8jt (servis/ganti injector)',
          status: 'beta',
          confidence: 'medium',
          catatan_verifikasi:
            'Isu injector diesel common-rail 2KD banyak dibahas, terutama bila sering pakai solar kualitas rendah.',
        },
      ],
    },
  },
  {
    id: 'tierb-xpander',
    brand: 'Mitsubishi',
    models: ['Xpander'],
    yearRanges: ['2017-sekarang'],
    version: 1,
    section: {
      severity: 'addon',
      tier: 'B',
      title: 'Penyakit khas Xpander',
      deskripsi: 'Isu yang umum dilaporkan untuk Xpander generasi awal.',
      items: [
        {
          id: 'b_xpander_fuel_pump',
          label: 'Recall fuel pump sudah dikerjakan',
          cara_cek:
            'Xpander produksi awal termasuk dalam recall resmi fuel pump. Tanya penjual apakah unit sudah menjalani recall; cek buku servis atau minta bukti dari dealer Mitsubishi (bisa dicek via nomor rangka).',
          tanda_bahaya:
            'Belum recall + ada gejala mesin susah hidup/mati mendadak. Recall-nya gratis di dealer, tapi pastikan sebelum beli.',
          severity: 'minor',
          input_type: 'boolean',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Gratis via recall resmi (bila berlaku)',
          status: 'beta',
          confidence: 'high',
          catatan_verifikasi:
            'Recall fuel pump Xpander adalah kampanye resmi Mitsubishi Indonesia yang terdokumentasi luas.',
        },
      ],
    },
  },
]

/** Cari template Tier B yang cocok untuk kendaraan yang dipilih */
export function findTierB(model: string, yearRange: string): TierBTemplate | undefined {
  const m = model.trim().toLowerCase()
  return TIER_B_TEMPLATES.find(
    (t) =>
      t.models.some((tm) => tm.toLowerCase() === m) &&
      (t.yearRanges.length === 0 || t.yearRanges.includes(yearRange)),
  )
}
