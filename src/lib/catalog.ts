/**
 * Katalog shortlist (docs/prd.md §9 keputusan 1): ~50 model terlaris di pasar
 * mobil bekas Indonesia, cukup untuk menutup mayoritas pencarian. Model di luar
 * daftar ini tetap bisa dipakai lewat entri manual di /inspeksi/baru — template
 * checklist-nya dibuat saat itu (generate-once → cache).
 */

export type CatalogModel = {
  model: string;
  /** Rentang tahun mengikuti generasi/facelift yang dikenal pembeli. */
  yearRanges: string[];
};

export type CatalogBrand = {
  brand: string;
  models: CatalogModel[];
};

export const CATALOG: CatalogBrand[] = [
  {
    brand: "Toyota",
    models: [
      { model: "Avanza", yearRanges: ["2004-2011", "2012-2015", "2016-2021", "2022-sekarang"] },
      { model: "Kijang Innova", yearRanges: ["2004-2015", "2016-2022", "2022-sekarang"] },
      { model: "Rush", yearRanges: ["2006-2017", "2018-sekarang"] },
      { model: "Agya", yearRanges: ["2013-2016", "2017-2022", "2023-sekarang"] },
      { model: "Calya", yearRanges: ["2016-sekarang"] },
      { model: "Yaris", yearRanges: ["2006-2013", "2014-2021"] },
      { model: "Vios", yearRanges: ["2007-2013", "2014-sekarang"] },
      { model: "Fortuner", yearRanges: ["2005-2015", "2016-sekarang"] },
      { model: "Sienta", yearRanges: ["2016-2021"] },
      { model: "Raize", yearRanges: ["2021-sekarang"] },
      { model: "Kijang Kapsul", yearRanges: ["1997-2004"] },
    ],
  },
  {
    brand: "Daihatsu",
    models: [
      { model: "Xenia", yearRanges: ["2004-2011", "2012-2015", "2016-2021", "2022-sekarang"] },
      { model: "Terios", yearRanges: ["2006-2017", "2018-sekarang"] },
      { model: "Ayla", yearRanges: ["2013-2016", "2017-2022", "2023-sekarang"] },
      { model: "Sigra", yearRanges: ["2016-sekarang"] },
      { model: "Gran Max", yearRanges: ["2007-sekarang"] },
      { model: "Luxio", yearRanges: ["2009-sekarang"] },
      { model: "Rocky", yearRanges: ["2021-sekarang"] },
    ],
  },
  {
    brand: "Honda",
    models: [
      { model: "Brio", yearRanges: ["2013-2018", "2018-sekarang"] },
      { model: "Jazz", yearRanges: ["2004-2008", "2008-2014", "2014-2021"] },
      { model: "Mobilio", yearRanges: ["2014-2016", "2017-sekarang"] },
      { model: "HR-V", yearRanges: ["2015-2021", "2022-sekarang"] },
      { model: "BR-V", yearRanges: ["2016-2021", "2022-sekarang"] },
      { model: "CR-V", yearRanges: ["2007-2012", "2012-2017", "2017-2022"] },
      { model: "City", yearRanges: ["2009-2014", "2014-2021"] },
      { model: "Civic", yearRanges: ["2006-2011", "2012-2016", "2016-2021"] },
      { model: "Freed", yearRanges: ["2009-2016"] },
      { model: "WR-V", yearRanges: ["2022-sekarang"] },
    ],
  },
  {
    brand: "Suzuki",
    models: [
      { model: "Ertiga", yearRanges: ["2012-2018", "2018-sekarang"] },
      { model: "XL7", yearRanges: ["2020-sekarang"] },
      { model: "Karimun Wagon R", yearRanges: ["2013-sekarang"] },
      { model: "Ignis", yearRanges: ["2017-sekarang"] },
      { model: "Baleno", yearRanges: ["2017-sekarang"] },
      { model: "APV", yearRanges: ["2004-2019", "2020-sekarang"] },
      { model: "Swift", yearRanges: ["2005-2017"] },
    ],
  },
  {
    brand: "Mitsubishi",
    models: [
      { model: "Xpander", yearRanges: ["2017-2021", "2022-sekarang"] },
      { model: "Pajero Sport", yearRanges: ["2009-2015", "2016-sekarang"] },
      { model: "Mirage", yearRanges: ["2012-sekarang"] },
      { model: "Outlander Sport", yearRanges: ["2012-2019"] },
      { model: "L300", yearRanges: ["1995-sekarang"] },
      { model: "Triton", yearRanges: ["2006-2014", "2015-sekarang"] },
    ],
  },
  {
    brand: "Nissan",
    models: [
      { model: "Grand Livina", yearRanges: ["2007-2013", "2013-2019"] },
      { model: "March", yearRanges: ["2010-2017"] },
      { model: "Juke", yearRanges: ["2011-2017"] },
      { model: "X-Trail", yearRanges: ["2008-2014", "2014-2019"] },
    ],
  },
  {
    brand: "Wuling",
    models: [
      { model: "Confero", yearRanges: ["2017-sekarang"] },
      { model: "Cortez", yearRanges: ["2018-sekarang"] },
      { model: "Almaz", yearRanges: ["2019-sekarang"] },
    ],
  },
  {
    brand: "Mazda",
    models: [
      { model: "Mazda2", yearRanges: ["2010-2014", "2015-sekarang"] },
      { model: "Mazda3", yearRanges: ["2011-2018"] },
      { model: "CX-5", yearRanges: ["2012-2017", "2017-sekarang"] },
    ],
  },
  {
    brand: "Hyundai",
    models: [
      { model: "Creta", yearRanges: ["2022-sekarang"] },
      { model: "Stargazer", yearRanges: ["2022-sekarang"] },
      { model: "Grand i10", yearRanges: ["2013-2019"] },
    ],
  },
  {
    brand: "Kia",
    models: [
      { model: "Picanto", yearRanges: ["2011-2017"] },
      { model: "Rio", yearRanges: ["2012-2017"] },
      { model: "Carens", yearRanges: ["2013-2018"] },
    ],
  },
  {
    brand: "Datsun",
    models: [{ model: "Go+ Panca", yearRanges: ["2014-2019"] }],
  },
  {
    brand: "Isuzu",
    models: [
      { model: "Panther", yearRanges: ["2000-2013"] },
      { model: "MU-X", yearRanges: ["2014-2020"] },
    ],
  },
];

export function catalogBrands(): string[] {
  return CATALOG.map((entry) => entry.brand);
}

export function modelsOf(brand: string): CatalogModel[] {
  return CATALOG.find((entry) => entry.brand === brand)?.models ?? [];
}

export function yearRangesOf(brand: string, model: string): string[] {
  return modelsOf(brand).find((entry) => entry.model === model)?.yearRanges ?? [];
}

export type CatalogHit = { brand: string; model: string; yearRanges: string[] };

export function searchCatalog(query: string, limit = 12): CatalogHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: CatalogHit[] = [];
  for (const brandEntry of CATALOG) {
    for (const modelEntry of brandEntry.models) {
      const haystack = `${brandEntry.brand} ${modelEntry.model}`.toLowerCase();
      if (haystack.includes(q)) {
        hits.push({
          brand: brandEntry.brand,
          model: modelEntry.model,
          yearRanges: modelEntry.yearRanges,
        });
      }
    }
  }
  return hits.slice(0, limit);
}

export function isInCatalog(brand: string, model: string): boolean {
  return modelsOf(brand).some((entry) => entry.model === model);
}
