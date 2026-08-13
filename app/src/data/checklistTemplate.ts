export type Severity = 'major' | 'minor' | 'addon'
export type InputType = 'boolean' | 'scale' | 'text' | 'photo'

export type ChecklistItem = {
  id: string
  label: string
  cara_cek: string
  tanda_bahaya: string
  severity: Severity
  input_type: InputType
  wajib_foto: boolean
  estimasi_biaya_perbaikan: string
}

export type ChecklistSection = {
  severity: Severity
  title: string
  deskripsi: string
  items: ChecklistItem[]
}

export type ChecklistTemplate = {
  template_id: string
  version: number
  tier: 'A'
  meta: {
    judul: string
    deskripsi: string
    disclaimer: string
  }
  sections: ChecklistSection[]
}

export const checklistTemplate: ChecklistTemplate = {
  template_id: 'universal-mobil-bekas-tier-a',
  version: 1,
  tier: 'A',
  meta: {
    judul: 'Checklist Universal Mobil Bekas',
    deskripsi:
      'Pemeriksaan dasar untuk pembeli mobil bekas agar lebih percaya diri sebelum transaksi.',
    disclaimer:
      'Hasil inspeksi ini adalah alat bantu keputusan, bukan jaminan kondisi kendaraan. Tetap lakukan verifikasi akhir di bengkel terpercaya.'
  },
  sections: [
    {
      severity: 'major',
      title: 'Dokumen & Legalitas',
      deskripsi:
        'Langkah wajib sebelum membahas kondisi fisik mobil. Dokumen bermasalah bisa jadi deal-breaker.',
      items: [
        {
          id: 'doc_rangka_match',
          label: 'Nomor rangka cocok dengan BPKB & STNK',
          cara_cek:
            'Cari nomor rangka di bodi mobil, lalu cocokkan digit demi digit dengan BPKB dan STNK.',
          tanda_bahaya:
            'Nomor tidak cocok, tampak diketuk ulang, digrinda, atau ditutup cat baru.',
          severity: 'major',
          input_type: 'boolean',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Deal-breaker (batalkan)'
        },
        {
          id: 'doc_mesin_match',
          label: 'Nomor mesin cocok dengan BPKB & STNK',
          cara_cek:
            'Temukan nomor mesin di blok mesin, lalu cocokkan dengan dokumen resmi kendaraan.',
          tanda_bahaya: 'Nomor tidak cocok atau mesin tampak diganti tanpa dokumen pendukung.',
          severity: 'major',
          input_type: 'boolean',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Deal-breaker (batalkan)'
        },
        {
          id: 'doc_pajak_blokir',
          label: 'Status pajak & blokir',
          cara_cek:
            'Cek tanggal pajak di STNK dan verifikasi status blokir/tunggakan lewat kanal Samsat resmi.',
          tanda_bahaya: 'Pajak mati lama, status diblokir, atau tunggakan besar.',
          severity: 'major',
          input_type: 'text',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 0 - beberapa juta'
        }
      ]
    },
    {
      severity: 'major',
      title: 'Tanda Bekas Banjir',
      deskripsi:
        'Kerusakan kelistrikan dan korosi pasca banjir sering muncul bertahap dan biayanya mahal.',
      items: [
        {
          id: 'flood_lumpur_tersembunyi',
          label: 'Lumpur/karat di area tersembunyi',
          cara_cek:
            'Periksa bawah karpet, kolong jok, area ban serep, serta celah bagasi.',
          tanda_bahaya: 'Ada endapan lumpur, garis air, atau karat tidak wajar.',
          severity: 'major',
          input_type: 'photo',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Sangat mahal / tidak terprediksi'
        },
        {
          id: 'flood_kabel_korosi',
          label: 'Korosi pada kabel & konektor',
          cara_cek:
            'Cek konektor yang mudah terlihat di ruang mesin dan bawah dashboard.',
          tanda_bahaya: 'Korosi kehijauan/putih, kabel getas, atau bekas endapan air.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Rp 1jt - puluhan juta'
        }
      ]
    },
    {
      severity: 'major',
      title: 'Bekas Tabrak / Rangka',
      deskripsi:
        'Tabrak berat dapat memengaruhi struktur dan keamanan mobil dalam jangka panjang.',
      items: [
        {
          id: 'crash_celah_panel',
          label: 'Kelurusan bodi & celah antar panel',
          cara_cek:
            'Bandingkan celah kap, pintu, fender, dan bagasi dari kiri/kanan. Harus simetris.',
          tanda_bahaya: 'Celah timpang, panel tidak rata, pintu susah menutup.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Bervariasi; bisa indikasi tabrak berat'
        },
        {
          id: 'crash_las_potong',
          label: 'Bekas las/potong pada rangka',
          cara_cek: 'Lihat area apron ruang mesin dan bagasi, cari sambungan tak orisinil.',
          tanda_bahaya: 'Bekas las kasar, dempul tebal, atau jejak potong rangka.',
          severity: 'major',
          input_type: 'boolean',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Risiko keamanan tinggi'
        }
      ]
    },
    {
      severity: 'major',
      title: 'Mesin & Transmisi',
      deskripsi: 'Pemeriksaan mesin dingin dan test drive akan mengungkap banyak risiko mahal.',
      items: [
        {
          id: 'eng_asap_knalpot',
          label: 'Warna asap knalpot saat start/di-gas',
          cara_cek: 'Perhatikan asap saat start pertama dan saat pedal gas diinjak perlahan.',
          tanda_bahaya: 'Asap putih tebal, biru, atau hitam pekat.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 2jt - puluhan juta'
        },
        {
          id: 'eng_oli_air',
          label: 'Oli bercampur air (emulsi)',
          cara_cek:
            'Cek dipstick dan tutup oli. Pastikan tidak ada busa/cairan warna kopi susu.',
          tanda_bahaya: 'Emulsi coklat susu (indikasi kebocoran internal mesin).',
          severity: 'major',
          input_type: 'photo',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Rp 3jt - belasan juta'
        },
        {
          id: 'trans_matic_manual',
          label: 'Perpindahan transmisi halus',
          cara_cek: 'Saat test drive, rasakan perpindahan gigi di berbagai kecepatan.',
          tanda_bahaya: 'Hentakan, slip, jeda lama, atau bunyi tidak normal.',
          severity: 'major',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 1,5jt - puluhan juta'
        }
      ]
    },
    {
      severity: 'minor',
      title: 'Kaki-kaki, Odometer & Interior',
      deskripsi: 'Biasanya menjadi bahan negosiasi harga, tetapi tetap perlu dinilai dengan rapi.',
      items: [
        {
          id: 'odo_kewajaran',
          label: 'Kewajaran KM vs kondisi aus',
          cara_cek: 'Bandingkan odometer dengan keausan pedal, kemudi, jok, dan tuas transmisi.',
          tanda_bahaya: 'KM rendah namun interior sudah aus berat.',
          severity: 'minor',
          input_type: 'text',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Indikator kejujuran / amunisi nego'
        },
        {
          id: 'susp_bunyi',
          label: 'Bunyi kaki-kaki saat jalan rusak',
          cara_cek: 'Lewati jalan bergelombang/polisi tidur dengan kecepatan rendah.',
          tanda_bahaya: 'Bunyi gluduk/ketok berulang, limbung berlebihan.',
          severity: 'minor',
          input_type: 'scale',
          wajib_foto: false,
          estimasi_biaya_perbaikan: 'Rp 500rb - 5jt'
        },
        {
          id: 'dashboard_indikator',
          label: 'Lampu indikator dashboard normal',
          cara_cek: 'Saat mesin menyala stabil, pastikan lampu peringatan penting padam.',
          tanda_bahaya: 'Check engine, ABS, airbag, atau indikator lain tetap menyala.',
          severity: 'major',
          input_type: 'photo',
          wajib_foto: true,
          estimasi_biaya_perbaikan: 'Perlu scan dan diagnosa lanjut'
        }
      ]
    }
  ]
}
