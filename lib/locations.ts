import { promises as fs } from "node:fs";
import path from "node:path";

export interface Location {
  location_id: string;
  name: string;
  type: string;
  ref_id: string;
  address: string;
  coordinates: { lat: number; lng: number };
  operating_hours: string;
}

const LOCATIONS_PATH = path.join(process.cwd(), "data", "common", "locations.json");

let _locations: Location[] | null = null;

export async function loadLocations(): Promise<Location[]> {
  if (!_locations) {
    const raw = await fs.readFile(LOCATIONS_PATH, "utf8");
    _locations = JSON.parse(raw) as Location[];
  }
  return _locations;
}

export async function searchLocations(query: string): Promise<Location[]> {
  const locs = await loadLocations();
  const q = query.toLowerCase().trim();
  if (!q) return locs.slice(0, 10);
  return locs.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q)
  ).slice(0, 10);
}

export async function getLocationsByType(type: string): Promise<Location[]> {
  const locs = await loadLocations();
  return locs.filter((l) => l.type === type.toUpperCase());
}

export async function getLocationsByRefId(refId: string): Promise<Location[]> {
  const locs = await loadLocations();
  return locs.filter((l) => l.ref_id === refId);
}
