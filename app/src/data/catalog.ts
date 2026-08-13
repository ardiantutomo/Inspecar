/**
 * Katalog shortlist — sesuai Keputusan 1 di prd.md §9:
 * mulai dari model terlaris yang menutup mayoritas pasar mobil bekas Indonesia.
 * Model di luar daftar tetap bisa diinspeksi lewat input manual
 * (dapat checklist universal Tier A).
 */

export interface CatalogEntry {
  brand: string
  model: string
  yearRanges: string[]
}

export const CATALOG: CatalogEntry[] = [
  { brand: 'Toyota', model: 'Avanza', yearRanges: ['2004-2011', '2012-2015', '2016-2021', '2022-sekarang'] },
  { brand: 'Toyota', model: 'Kijang Innova', yearRanges: ['2004-2015', '2016-2022', '2023-sekarang'] },
  { brand: 'Toyota', model: 'Rush', yearRanges: ['2006-2017', '2018-sekarang'] },
  { brand: 'Toyota', model: 'Agya', yearRanges: ['2013-2022', '2023-sekarang'] },
  { brand: 'Toyota', model: 'Calya', yearRanges: ['2016-sekarang'] },
  { brand: 'Toyota', model: 'Yaris', yearRanges: ['2006-2013', '2014-2022'] },
  { brand: 'Toyota', model: 'Vios', yearRanges: ['2003-2007', '2007-2013', '2013-2022'] },
  { brand: 'Toyota', model: 'Fortuner', yearRanges: ['2005-2015', '2016-sekarang'] },
  { brand: 'Toyota', model: 'Alphard', yearRanges: ['2008-2014', '2015-2023'] },
  { brand: 'Daihatsu', model: 'Xenia', yearRanges: ['2004-2011', '2012-2015', '2016-2021', '2022-sekarang'] },
  { brand: 'Daihatsu', model: 'Terios', yearRanges: ['2006-2017', '2018-sekarang'] },
  { brand: 'Daihatsu', model: 'Ayla', yearRanges: ['2013-2022', '2023-sekarang'] },
  { brand: 'Daihatsu', model: 'Sigra', yearRanges: ['2016-sekarang'] },
  { brand: 'Daihatsu', model: 'Gran Max', yearRanges: ['2007-sekarang'] },
  { brand: 'Honda', model: 'Brio', yearRanges: ['2012-2018', '2018-sekarang'] },
  { brand: 'Honda', model: 'Jazz', yearRanges: ['2004-2008', '2008-2014', '2014-2021'] },
  { brand: 'Honda', model: 'HR-V', yearRanges: ['2015-2021', '2022-sekarang'] },
  { brand: 'Honda', model: 'CR-V', yearRanges: ['2002-2006', '2007-2012', '2012-2016', '2017-2023'] },
  { brand: 'Honda', model: 'Mobilio', yearRanges: ['2014-2021'] },
  { brand: 'Honda', model: 'City', yearRanges: ['2003-2008', '2009-2013', '2014-2021'] },
  { brand: 'Honda', model: 'Civic', yearRanges: ['2006-2011', '2012-2015', '2016-2021'] },
  { brand: 'Suzuki', model: 'Ertiga', yearRanges: ['2012-2018', '2018-sekarang'] },
  { brand: 'Suzuki', model: 'Carry', yearRanges: ['2005-2019', '2019-sekarang'] },
  { brand: 'Suzuki', model: 'XL7', yearRanges: ['2020-sekarang'] },
  { brand: 'Suzuki', model: 'Baleno', yearRanges: ['2017-sekarang'] },
  { brand: 'Suzuki', model: 'Swift', yearRanges: ['2005-2012', '2012-2017'] },
  { brand: 'Mitsubishi', model: 'Xpander', yearRanges: ['2017-sekarang'] },
  { brand: 'Mitsubishi', model: 'Pajero Sport', yearRanges: ['2009-2015', '2016-sekarang'] },
  { brand: 'Mitsubishi', model: 'L300', yearRanges: ['1990-sekarang'] },
  { brand: 'Nissan', model: 'Grand Livina', yearRanges: ['2007-2013', '2013-2019'] },
  { brand: 'Nissan', model: 'X-Trail', yearRanges: ['2003-2008', '2009-2014', '2014-2022'] },
  { brand: 'Nissan', model: 'March', yearRanges: ['2010-2020'] },
  { brand: 'Wuling', model: 'Confero', yearRanges: ['2017-sekarang'] },
  { brand: 'Wuling', model: 'Almaz', yearRanges: ['2019-sekarang'] },
  { brand: 'Hyundai', model: 'Creta', yearRanges: ['2022-sekarang'] },
  { brand: 'Kia', model: 'Picanto', yearRanges: ['2004-2011', '2011-2017'] },
]

export const BRANDS = [...new Set(CATALOG.map((c) => c.brand))]

export function modelsForBrand(brand: string): CatalogEntry[] {
  return CATALOG.filter((c) => c.brand === brand)
}
