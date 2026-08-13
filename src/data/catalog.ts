import type { VehicleCatalogEntry } from "@/lib/types";

/** Shortlist model terlaris pasar bekas Indonesia (~40 model). */
export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { id: "toyota-avanza-2012-2015", brand: "Toyota", model: "Avanza", year_range: "2012-2015", popular: true },
  { id: "toyota-avanza-2015-2019", brand: "Toyota", model: "Avanza", year_range: "2015-2019", popular: true },
  { id: "toyota-avanza-2019-2023", brand: "Toyota", model: "Avanza", year_range: "2019-2023", popular: true },
  { id: "toyota-innova-2013-2015", brand: "Toyota", model: "Innova", year_range: "2013-2015", popular: true },
  { id: "toyota-innova-2016-2020", brand: "Toyota", model: "Innova", year_range: "2016-2020", popular: true },
  { id: "toyota-innova-zenix-2022-2025", brand: "Toyota", model: "Innova Zenix", year_range: "2022-2025", popular: true },
  { id: "toyota-rush-2018-2023", brand: "Toyota", model: "Rush", year_range: "2018-2023", popular: true },
  { id: "toyota-calya-2016-2023", brand: "Toyota", model: "Calya", year_range: "2016-2023", popular: true },
  { id: "toyota-agya-2017-2023", brand: "Toyota", model: "Agya", year_range: "2017-2023" },
  { id: "toyota-fortuner-2016-2021", brand: "Toyota", model: "Fortuner", year_range: "2016-2021" },
  { id: "toyota-yaris-2014-2018", brand: "Toyota", model: "Yaris", year_range: "2014-2018" },
  { id: "daihatsu-xenia-2012-2015", brand: "Daihatsu", model: "Xenia", year_range: "2012-2015", popular: true },
  { id: "daihatsu-xenia-2015-2019", brand: "Daihatsu", model: "Xenia", year_range: "2015-2019", popular: true },
  { id: "daihatsu-terios-2018-2023", brand: "Daihatsu", model: "Terios", year_range: "2018-2023", popular: true },
  { id: "daihatsu-sigra-2016-2023", brand: "Daihatsu", model: "Sigra", year_range: "2016-2023", popular: true },
  { id: "daihatsu-ayla-2017-2023", brand: "Daihatsu", model: "Ayla", year_range: "2017-2023" },
  { id: "honda-brio-2016-2018", brand: "Honda", model: "Brio", year_range: "2016-2018", popular: true },
  { id: "honda-brio-2018-2023", brand: "Honda", model: "Brio", year_range: "2018-2023", popular: true },
  { id: "honda-hrv-2015-2018", brand: "Honda", model: "HR-V", year_range: "2015-2018", popular: true },
  { id: "honda-hrv-2018-2021", brand: "Honda", model: "HR-V", year_range: "2018-2021", popular: true },
  { id: "honda-hrv-2022-2025", brand: "Honda", model: "HR-V", year_range: "2022-2025", popular: true },
  { id: "honda-mobilio-2014-2019", brand: "Honda", model: "Mobilio", year_range: "2014-2019" },
  { id: "honda-jazz-2014-2018", brand: "Honda", model: "Jazz", year_range: "2014-2018" },
  { id: "honda-crv-2017-2022", brand: "Honda", model: "CR-V", year_range: "2017-2022" },
  { id: "honda-city-hatchback-2021-2025", brand: "Honda", model: "City Hatchback", year_range: "2021-2025" },
  { id: "suzuki-ertiga-2018-2022", brand: "Suzuki", model: "Ertiga", year_range: "2018-2022", popular: true },
  { id: "suzuki-xl7-2020-2025", brand: "Suzuki", model: "XL7", year_range: "2020-2025", popular: true },
  { id: "suzuki-ignis-2017-2023", brand: "Suzuki", model: "Ignis", year_range: "2017-2023" },
  { id: "suzuki-baleno-2017-2022", brand: "Suzuki", model: "Baleno", year_range: "2017-2022" },
  { id: "mitsubishi-xpander-2017-2021", brand: "Mitsubishi", model: "Xpander", year_range: "2017-2021", popular: true },
  { id: "mitsubishi-xpander-2021-2025", brand: "Mitsubishi", model: "Xpander", year_range: "2021-2025", popular: true },
  { id: "mitsubishi-pajero-sport-2016-2021", brand: "Mitsubishi", model: "Pajero Sport", year_range: "2016-2021" },
  { id: "mitsubishi-triton-2019-2024", brand: "Mitsubishi", model: "Triton", year_range: "2019-2024" },
  { id: "nissan-grand-livina-2013-2019", brand: "Nissan", model: "Grand Livina", year_range: "2013-2019" },
  { id: "nissan-livina-2019-2023", brand: "Nissan", model: "Livina", year_range: "2019-2023" },
  { id: "wuling-confero-2018-2023", brand: "Wuling", model: "Confero", year_range: "2018-2023" },
  { id: "wuling-almaz-2019-2023", brand: "Wuling", model: "Almaz", year_range: "2019-2023" },
  { id: "hyundai-creta-2022-2025", brand: "Hyundai", model: "Creta", year_range: "2022-2025" },
  { id: "hyundai-stargazer-2022-2025", brand: "Hyundai", model: "Stargazer", year_range: "2022-2025", popular: true },
  { id: "mazda-cx5-2017-2022", brand: "Mazda", model: "CX-5", year_range: "2017-2022" },
];

export function getBrands(): string[] {
  return [...new Set(VEHICLE_CATALOG.map((v) => v.brand))].sort();
}

export function getModels(brand: string): string[] {
  return [
    ...new Set(
      VEHICLE_CATALOG.filter((v) => v.brand === brand).map((v) => v.model),
    ),
  ].sort();
}

export function getYearRanges(brand: string, model: string): string[] {
  return VEHICLE_CATALOG.filter(
    (v) => v.brand === brand && v.model === model,
  ).map((v) => v.year_range);
}

export function findCatalogEntry(
  brand: string,
  model: string,
  year_range: string,
): VehicleCatalogEntry | undefined {
  return VEHICLE_CATALOG.find(
    (v) =>
      v.brand === brand && v.model === model && v.year_range === year_range,
  );
}
