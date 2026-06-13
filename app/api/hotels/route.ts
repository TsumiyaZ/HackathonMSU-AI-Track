import { NextResponse } from "next/server";
import { listHotels } from "@/lib/hotels";
import type { HotelListFilters } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const filters: HotelListFilters = {
    search: sp.get("search")?.trim() || undefined,
    city: sp.get("city") || undefined,
    minStars: sp.get("minStars") ? Number(sp.get("minStars")) : undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    amenities: sp.get("amenities")?.split(",").filter(Boolean) || undefined,
    sort: (sp.get("sort") as HotelListFilters["sort"]) || undefined,
  };

  const hotels = await listHotels(filters);
  return NextResponse.json({
    count: hotels.length,
    filters,
    data: hotels,
  });
}
