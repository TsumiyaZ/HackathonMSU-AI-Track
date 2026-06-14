import { promises as fs } from "node:fs";
import path from "node:path";

// ==============================
// Types
// ==============================

export interface Flight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  price: number;
}

export interface FlightTicket {
  ticket_id: string;
  user_id: string;
  flight_id: string;
  seat: string;
  status: string;
}

export type FlightTicketStatus =
  | "ISSUED"
  | "CHECKED_IN"
  | "BOARDED"
  | "CANCELLED";

export interface FlightListFilters {
  origin?: string;
  destination?: string;
  airline?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "departure_asc" | "departure_desc";
}

export interface FlightBookingSummary {
  total: number;
  issued: number;
  checked_in: number;
  boarded: number;
  cancelled: number;
}

// ==============================
// Airport code → City name map
// ==============================
export const AIRPORT_NAMES: Record<string, string> = {
  BKK: "สุวรรณภูมิ",
  DMK: "ดอนเมือง",
  CNX: "เชียงใหม่",
  HKT: "ภูเก็ต",
  KBV: "กระบี่",
  USM: "สมุย",
  HDY: "หาดใหญ่",
  CEI: "เชียงราย",
  KKC: "ขอนแก่น",
  UBP: "อุบลราชธานี",
  UTH: "อุดรธานี",
  NST: "นครศรีธรรมราช",
  URT: "สุราษฎร์ธานี",
  MAQ: "แม่สอด",
  TDX: "ตราด",
  ROI: "ร้อยเอ็ด",
  PHS: "พิษณุโลก",
  CJM: "เชียงของ",
  NAW: "นราธิวาส",
  SNO: "สกลนคร",
  LOE: "เลย",
  KOP: "นครพนม",
  PRH: "แพร่",
  NNT: "น่าน",
  HGN: "แม่ฮ่องสอน",
  TST: "ตรัง",
  // International
  NRT: "โตเกียว (นาริตะ)",
  SIN: "สิงคโปร์",
  LHR: "ลอนดอน (ฮีทโธรว์)",
  HKG: "ฮ่องกง",
  ICN: "โซล (อินชอน)",
  CDG: "ปารีส (ชาร์ล เดอ โกล)",
  JFK: "นิวยอร์ก (JFK)",
  SYD: "ซิดนีย์",
  DXB: "ดูไบ",
  ZRH: "ซูริค",
  TPE: "ไทเป",
  KUL: "กัวลาลัมเปอร์",
  SGN: "โฮจิมินห์",
  PEK: "ปักกิ่ง",
};

export const AIRLINE_COLORS: Record<string, string> = {
  "Thai Sky": "bg-sky-500/15 text-sky-500 border-sky-500/30",
  "Siam Airways": "bg-violet-500/15 text-violet-500 border-violet-500/30",
  "Andaman Jet": "bg-teal-500/15 text-teal-500 border-teal-500/30",
  "Royal Thai": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "Eco Jet": "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "North Star": "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  "Bangkok Flyer": "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

export function getAirportName(code: string): string {
  return AIRPORT_NAMES[code] || code;
}

export function getFlightDuration(origin: string, dest: string): string {
  // Estimate duration from airport codes (domestic short / international long)
  const domestic = [
    "BKK","DMK","CNX","HKT","KBV","USM","HDY","CEI","KKC","UBP",
    "UTH","NST","URT","MAQ","TDX","ROI","PHS","CJM","NAW","SNO",
    "LOE","KOP","PRH","NNT","HGN","TST",
  ];
  const isDomestic = domestic.includes(origin) && domestic.includes(dest);
  if (isDomestic) {
    const seed = (origin.charCodeAt(0) + dest.charCodeAt(0)) % 4;
    const h = 1;
    const m = [10, 20, 35, 50][seed];
    return `${h}ชม. ${m}น.`;
  }
  // International
  const longHaul = ["LHR","CDG","JFK","SYD","ZRH"];
  if (longHaul.includes(dest) || longHaul.includes(origin)) {
    const seed = (origin.charCodeAt(0) + dest.charCodeAt(0)) % 4;
    return `${9 + seed}ชม. ${[15, 30, 45, 55][seed]}น.`;
  }
  // Regional
  const seed = (origin.charCodeAt(0) + dest.charCodeAt(0)) % 4;
  return `${3 + seed}ชม. ${[10, 25, 40, 50][seed]}น.`;
}

// ==============================
// Data loading
// ==============================

const DATA_ROOT = path.join(process.cwd(), "data");

async function readJson<T>(relPath: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_ROOT, relPath), "utf8");
  return JSON.parse(raw) as T;
}

let _flights: Flight[] | null = null;
let _tickets: FlightTicket[] | null = null;

export async function loadFlights(): Promise<Flight[]> {
  if (!_flights) {
    _flights = await readJson<Flight[]>("travel/flights.json");
  }
  return _flights;
}

export async function loadTickets(): Promise<FlightTicket[]> {
  if (!_tickets) {
    _tickets = await readJson<FlightTicket[]>("travel/flight_tickets.json");
  }
  return _tickets;
}

export async function getFlightById(id: string): Promise<Flight | null> {
  const flights = await loadFlights();
  return flights.find((f) => f.flight_id === id) ?? null;
}

// ==============================
// Unique values for filters
// ==============================

export async function getFlightOrigins(): Promise<string[]> {
  const flights = await loadFlights();
  return Array.from(new Set(flights.map((f) => f.origin))).sort();
}

export async function getFlightDestinations(): Promise<string[]> {
  const flights = await loadFlights();
  return Array.from(new Set(flights.map((f) => f.destination))).sort();
}

export async function getFlightAirlines(): Promise<string[]> {
  const flights = await loadFlights();
  return Array.from(new Set(flights.map((f) => f.airline))).sort();
}

// ==============================
// Filtered listing
// ==============================

export async function listFlights(
  filters: FlightListFilters = {},
): Promise<Flight[]> {
  const flights = await loadFlights();
  const q = filters.search?.trim().toLowerCase();

  let result = flights.filter((f) => {
    if (filters.origin && f.origin !== filters.origin) return false;
    if (filters.destination && f.destination !== filters.destination) return false;
    if (filters.airline && f.airline !== filters.airline) return false;
    if (filters.minPrice && f.price < filters.minPrice) return false;
    if (filters.maxPrice && f.price > filters.maxPrice) return false;
    if (q) {
      const originName = getAirportName(f.origin).toLowerCase();
      const destName = getAirportName(f.destination).toLowerCase();
      const hay = `${f.airline} ${f.origin} ${f.destination} ${originName} ${destName} ${f.flight_id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price_asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "departure_asc":
      result = [...result].sort(
        (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime(),
      );
      break;
    case "departure_desc":
      result = [...result].sort(
        (a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime(),
      );
      break;
    default:
      // Default: price ascending
      result = [...result].sort((a, b) => a.price - b.price);
  }

  return result;
}

// ==============================
// Tickets for flight
// ==============================

export async function getTicketsForFlight(flightId: string): Promise<FlightTicket[]> {
  const tickets = await loadTickets();
  return tickets.filter((t) => t.flight_id === flightId);
}

export async function getFlightTicketSummary(flightId: string): Promise<FlightBookingSummary> {
  const tickets = await getTicketsForFlight(flightId);
  let issued = 0;
  let checked_in = 0;
  let boarded = 0;
  let cancelled = 0;

  for (const t of tickets) {
    switch (t.status) {
      case "ISSUED":
        issued++;
        break;
      case "CHECKED_IN":
        checked_in++;
        break;
      case "BOARDED":
        boarded++;
        break;
      case "CANCELLED":
        cancelled++;
        break;
    }
  }

  return {
    total: tickets.length,
    issued,
    checked_in,
    boarded,
    cancelled,
  };
}
