import { VehicleOption } from "@/types/checklist";

/** ~30 model terlaris pasar bekas Indonesia (PRD §9) */
export const VEHICLE_CATALOG: VehicleOption[] = [
  { brand: "Toyota", model: "Avanza", year_range: "2012-2015", label: "Toyota Avanza 2012–2015" },
  { brand: "Toyota", model: "Avanza", year_range: "2016-2021", label: "Toyota Avanza 2016–2021" },
  { brand: "Toyota", model: "Xenia", year_range: "2012-2015", label: "Toyota Xenia 2012–2015" },
  { brand: "Toyota", model: "Innova", year_range: "2012-2015", label: "Toyota Innova 2012–2015" },
  { brand: "Toyota", model: "Innova", year_range: "2016-2022", label: "Toyota Innova 2016–2022" },
  { brand: "Toyota", model: "Rush", year_range: "2014-2017", label: "Toyota Rush 2014–2017" },
  { brand: "Toyota", model: "Fortuner", year_range: "2012-2015", label: "Toyota Fortuner 2012–2015" },
  { brand: "Toyota", model: "Yaris", year_range: "2014-2018", label: "Toyota Yaris 2014–2018" },
  { brand: "Honda", model: "Brio", year_range: "2014-2018", label: "Honda Brio 2014–2018" },
  { brand: "Honda", model: "Jazz", year_range: "2012-2015", label: "Honda Jazz 2012–2015" },
  { brand: "Honda", model: "HR-V", year_range: "2015-2019", label: "Honda HR-V 2015–2019" },
  { brand: "Honda", model: "Mobilio", year_range: "2014-2018", label: "Honda Mobilio 2014–2018" },
  { brand: "Honda", model: "CR-V", year_range: "2012-2015", label: "Honda CR-V 2012–2015" },
  { brand: "Daihatsu", model: "Xenia", year_range: "2012-2015", label: "Daihatsu Xenia 2012–2015" },
  { brand: "Daihatsu", model: "Terios", year_range: "2012-2016", label: "Daihatsu Terios 2012–2016" },
  { brand: "Daihatsu", model: "Sigra", year_range: "2016-2020", label: "Daihatsu Sigra 2016–2020" },
  { brand: "Suzuki", model: "Ertiga", year_range: "2013-2017", label: "Suzuki Ertiga 2013–2017" },
  { brand: "Suzuki", model: "Karimun", year_range: "2013-2017", label: "Suzuki Karimun 2013–2017" },
  { brand: "Suzuki", model: "APV", year_range: "2012-2016", label: "Suzuki APV 2012–2016" },
  { brand: "Mitsubishi", model: "Xpander", year_range: "2017-2021", label: "Mitsubishi Xpander 2017–2021" },
  { brand: "Mitsubishi", model: "Pajero Sport", year_range: "2012-2016", label: "Mitsubishi Pajero Sport 2012–2016" },
  { brand: "Nissan", model: "Grand Livina", year_range: "2012-2015", label: "Nissan Grand Livina 2012–2015" },
  { brand: "Nissan", model: "X-Trail", year_range: "2012-2015", label: "Nissan X-Trail 2012–2015" },
  { brand: "Wuling", model: "Confero", year_range: "2017-2020", label: "Wuling Confero 2017–2020" },
  { brand: "Hyundai", model: "Stargazer", year_range: "2022-2024", label: "Hyundai Stargazer 2022–2024" },
  { brand: "Kia", model: "Picanto", year_range: "2014-2018", label: "Kia Picanto 2014–2018" },
  { brand: "Ford", model: "Everest", year_range: "2012-2015", label: "Ford Everest 2012–2015" },
  { brand: "Chevrolet", model: "Spin", year_range: "2013-2017", label: "Chevrolet Spin 2013–2017" },
  { brand: "Mazda", model: "CX-5", year_range: "2013-2017", label: "Mazda CX-5 2013–2017" },
  { brand: "Lainnya", model: "Umum", year_range: "*", label: "Mobil lain / tahun lain" },
];

export const BRANDS = [...new Set(VEHICLE_CATALOG.map((v) => v.brand))].sort();

export function getModelsForBrand(brand: string): string[] {
  return [...new Set(VEHICLE_CATALOG.filter((v) => v.brand === brand).map((v) => v.model))].sort();
}

export function getVehiclesForBrandModel(brand: string, model: string): VehicleOption[] {
  return VEHICLE_CATALOG.filter((v) => v.brand === brand && v.model === model);
}

export function searchVehicles(query: string): VehicleOption[] {
  const q = query.toLowerCase().trim();
  if (!q) return VEHICLE_CATALOG;
  return VEHICLE_CATALOG.filter(
    (v) =>
      v.label.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
  );
}
