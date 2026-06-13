import { promises as fs } from "node:fs";
import path from "node:path";

export interface Restaurant {
  res_id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time_min: number;
}

const RESTAURANTS_PATH = path.join(process.cwd(), "data", "food", "restaurants.json");

let _restaurants: Restaurant[] | null = null;

export async function loadRestaurants(): Promise<Restaurant[]> {
  if (!_restaurants) {
    const raw = await fs.readFile(RESTAURANTS_PATH, "utf8");
    _restaurants = JSON.parse(raw) as Restaurant[];
  }
  return _restaurants;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const restaurants = await loadRestaurants();
  return restaurants.find((r) => r.res_id === id) ?? null;
}
