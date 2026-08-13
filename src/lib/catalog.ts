import type { VehicleCatalogEntry } from "@/lib/types";

/**
 * Katalog awal (~30 model terlaris di pasar mobil bekas Indonesia), di-seed
 * secara statis sesuai Keputusan #1 pada dokumen rencana: mulai dari shortlist
 * yang menutup mayoritas pasar, tumbuh on-demand kalau ada permintaan model lain.
 *
 * `tierBSlug` menandai model yang sudah punya contoh data Tier B (penyakit
 * spesifik model, beta) di src/data/tier-b/*.json. Model lain hanya akan
 * disajikan Tier A (universal) untuk saat ini.
 */
export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { brand: "Toyota", model: "Avanza", yearStart: 2012, yearEnd: 2021, tierBSlug: "toyota-avanza" },
  { brand: "Toyota", model: "Kijang Innova", yearStart: 2016, yearEnd: 2023, tierBSlug: "toyota-kijang-innova" },
  { brand: "Toyota", model: "Rush", yearStart: 2018, yearEnd: 2023 },
  { brand: "Toyota", model: "Agya", yearStart: 2017, yearEnd: 2023 },
  { brand: "Toyota", model: "Calya", yearStart: 2016, yearEnd: 2023 },
  { brand: "Toyota", model: "Yaris", yearStart: 2014, yearEnd: 2022 },
  { brand: "Toyota", model: "Fortuner", yearStart: 2016, yearEnd: 2023 },
  { brand: "Toyota", model: "Vios", yearStart: 2013, yearEnd: 2022 },
  { brand: "Daihatsu", model: "Xenia", yearStart: 2012, yearEnd: 2021, tierBSlug: "daihatsu-xenia" },
  { brand: "Daihatsu", model: "Terios", yearStart: 2018, yearEnd: 2023 },
  { brand: "Daihatsu", model: "Ayla", yearStart: 2017, yearEnd: 2023 },
  { brand: "Daihatsu", model: "Sigra", yearStart: 2016, yearEnd: 2023 },
  { brand: "Honda", model: "Brio", yearStart: 2013, yearEnd: 2023, tierBSlug: "honda-brio" },
  { brand: "Honda", model: "Mobilio", yearStart: 2014, yearEnd: 2021 },
  { brand: "Honda", model: "HR-V", yearStart: 2015, yearEnd: 2022 },
  { brand: "Honda", model: "CR-V", yearStart: 2012, yearEnd: 2022 },
  { brand: "Honda", model: "Jazz", yearStart: 2014, yearEnd: 2021 },
  { brand: "Honda", model: "BR-V", yearStart: 2016, yearEnd: 2023 },
  { brand: "Suzuki", model: "Ertiga", yearStart: 2013, yearEnd: 2023 },
  { brand: "Suzuki", model: "XL7", yearStart: 2020, yearEnd: 2023 },
  { brand: "Suzuki", model: "Baleno", yearStart: 2017, yearEnd: 2023 },
  { brand: "Mitsubishi", model: "Xpander", yearStart: 2017, yearEnd: 2023 },
  { brand: "Mitsubishi", model: "Pajero Sport", yearStart: 2015, yearEnd: 2023 },
  { brand: "Nissan", model: "Livina", yearStart: 2019, yearEnd: 2023 },
  { brand: "Mazda", model: "CX-5", yearStart: 2013, yearEnd: 2022 },
];

export function getBrands(): string[] {
  return Array.from(new Set(VEHICLE_CATALOG.map((v) => v.brand))).sort();
}

export function getModelsByBrand(brand: string): VehicleCatalogEntry[] {
  return VEHICLE_CATALOG.filter((v) => v.brand.toLowerCase() === brand.toLowerCase());
}

export function findVehicle(brand: string, model: string): VehicleCatalogEntry | undefined {
  return VEHICLE_CATALOG.find(
    (v) => v.brand.toLowerCase() === brand.toLowerCase() && v.model.toLowerCase() === model.toLowerCase()
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
