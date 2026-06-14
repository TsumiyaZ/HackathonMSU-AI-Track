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

export interface RestaurantListFilters {
  search?: string;
  cuisine?: string;
  minRating?: number;
  maxTime?: number;
  sort?: "rating" | "time" | "name";
}

export async function listRestaurants(filters?: RestaurantListFilters): Promise<Restaurant[]> {
  let list = await loadRestaurants();

  if (filters) {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
    }
    if (filters.cuisine && filters.cuisine !== "all") {
      list = list.filter((r) => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase());
    }
    if (filters.minRating) {
      list = list.filter((r) => r.rating >= filters.minRating!);
    }
    if (filters.maxTime) {
      list = list.filter((r) => r.delivery_time_min <= filters.maxTime!);
    }
    if (filters.sort) {
      if (filters.sort === "rating") {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (filters.sort === "time") {
        list = [...list].sort((a, b) => a.delivery_time_min - b.delivery_time_min);
      } else if (filters.sort === "name") {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      }
    } else {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
  } else {
    list = [...list].sort((a, b) => b.rating - a.rating);
  }

  return list;
}

export async function getRestaurantCuisines(): Promise<string[]> {
  const list = await loadRestaurants();
  const cuisines = new Set(list.map((r) => r.cuisine));
  return Array.from(cuisines).sort();
}

