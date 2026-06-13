export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  rating_avg: number;
  price_per_night_thb: number;
  rooms_available: number;
  tags: string[];
  amenities: string[];
  thumbnail_url: string;
}

export type HotelBookingStatus =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "PENDING";

export interface HotelBooking {
  booking_id: string;
  user_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: HotelBookingStatus;
}

export interface Review {
  review_id: string;
  target_type: string;
  target_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface HotelListFilters {
  city?: string;
  minStars?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  tags?: string[];
  search?: string;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "stars_desc";
}

export interface HotelBookingSummary {
  total: number;
  upcoming: number;
  active: number;
  cancelled: number;
  revenue_thb: number;
}

export interface HotelSentiment {
  summary: string;
  highlights: string[];
  warnings: string[];
  score: number;
  sample_size: number;
}
