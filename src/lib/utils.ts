import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ADDIS_SUB_CITIES = [
  "Addis Ketema",
  "Akaki Kality",
  "Arada",
  "Bole",
  "Gullele",
  "Kirkos",
  "Kolfe Keranio",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
  "Lemi Kura"
];

// Coordinates for sub-cities (approximate centers)
export const SUB_CITY_COORDS: Record<string, [number, number]> = {
  "Addis Ketema": [38.7397, 9.0326],
  "Akaki Kality": [38.7758, 8.8922],
  "Arada": [38.7525, 9.0333],
  "Bole": [38.7889, 9.0000],
  "Gullele": [38.7250, 9.0667],
  "Kirkos": [38.7611, 9.0111],
  "Kolfe Keranio": [38.7000, 9.0167],
  "Lideta": [38.7444, 9.0194],
  "Nifas Silk-Lafto": [38.7333, 8.9667],
  "Yeka": [38.8167, 9.0333],
  "Lemi Kura": [38.8500, 9.0167]
};

export const ADDIS_LOCATIONS = [
  { name: "Merkato", coords: [38.7397, 9.0326] },
  { name: "Shola", coords: [38.7889, 9.0333] },
  { name: "Shiro Meda", coords: [38.7525, 9.0667] },
  { name: "Kolfe", coords: [38.7000, 9.0167] },
  { name: "Ehil Berenda", coords: [38.7350, 9.0350] },
  { name: "Mesalemiya", coords: [38.7300, 9.0400] },
  { name: "Bole", coords: [38.7889, 9.0000] },
  { name: "Bole Medhanialem", coords: [38.7850, 8.9950] },
  { name: "Bole Atlas", coords: [38.7800, 9.0050] },
  { name: "Kazanchis", coords: [38.7650, 9.0200] },
  { name: "Piassa", coords: [38.7525, 9.0333] },
  { name: "Mexico", coords: [38.7450, 9.0150] },
  { name: "Sarbet", coords: [38.7350, 8.9950] },
  { name: "Megenagna", coords: [38.8050, 9.0200] },
  { name: "CMC", coords: [38.8450, 9.0150] },
  { name: "Gerji", coords: [38.8150, 8.9950] },
  { name: "Summit", coords: [38.8650, 9.0100] },
  { name: "4 Kilo", coords: [38.7600, 9.0350] },
  { name: "6 Kilo", coords: [38.7600, 9.0450] },
  { name: "Lideta", coords: [38.7444, 9.0194] },
  { name: "Meskel Square", coords: [38.7611, 9.0111] },
  { name: "Gurd Shola", coords: [38.8250, 9.0150] },
  { name: "Lebu", coords: [38.7050, 8.9550] },
  { name: "Jemo", coords: [38.6850, 8.9650] },
  { name: "Ayat", coords: [38.8850, 9.0250] },
  { name: "Kotebe", coords: [38.8250, 9.0450] },
  { name: "Tor Hailoch", coords: [38.7150, 9.0150] },
  { name: "Bambis", coords: [38.7700, 9.0150] },
  { name: "Arat Kilo", coords: [38.7600, 9.0350] },
  { name: "Stadium", coords: [38.7550, 9.0100] }
];

export const COMMON_CARS = [
  { name: "Toyota Vitz (1.0L)", consumption: 0.065, type: "petrol" },
  { name: "Toyota Vitz (1.3L)", consumption: 0.075, type: "petrol" },
  { name: "Toyota Yaris / Belta", consumption: 0.08, type: "petrol" },
  { name: "Toyota Corolla", consumption: 0.10, type: "petrol" },
  { name: "Suzuki Swift / Dzire", consumption: 0.06, type: "petrol" },
  { name: "Hyundai Atos / Santro", consumption: 0.07, type: "petrol" },
  { name: "Toyota Aqua (Hybrid)", consumption: 0.045, type: "hybrid" },
  { name: "Toyota Prius (Hybrid)", consumption: 0.05, type: "hybrid" },
  { name: "Toyota Hilux / Pickup", consumption: 0.13, type: "petrol" },
  { name: "SUV (Rav4 / Tucson)", consumption: 0.11, type: "petrol" },
  { name: "Custom / Other", consumption: 0.08, type: "petrol" }
];

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Studio",
  "Commercial",
  "Office",
  "Warehouse"
];

export const ROLES = {
  RENTER: "renter",
  OWNER: "owner",
  BROKER: "broker",
  ADMIN: "admin"
};
