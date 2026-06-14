import { listRestaurants, getRestaurantCuisines, RestaurantListFilters } from "@/lib/restaurants";
import RestaurantsListClient from "./RestaurantsListClient";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  search?: string;
  cuisine?: string;
  minRating?: string;
  maxTime?: string;
  sort?: string;
}>;

function parseFilters(sp: Awaited<SearchParams>): RestaurantListFilters {
  return {
    search: sp.search?.trim() || undefined,
    cuisine: sp.cuisine || undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    maxTime: sp.maxTime ? Number(sp.maxTime) : undefined,
    sort: (sp.sort as RestaurantListFilters["sort"]) || undefined,
  };
}

export default async function ExploreRestaurantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [restaurants, cuisines] = await Promise.all([
    listRestaurants(filters),
    getRestaurantCuisines(),
  ]);

  return (
    <RestaurantsListClient
      restaurants={restaurants}
      cuisines={cuisines}
    />
  );
}
