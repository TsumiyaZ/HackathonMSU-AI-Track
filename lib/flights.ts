import { promises as fs } from "node:fs";
import path from "node:path";

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

const FLIGHTS_PATH = path.join(process.cwd(), "data", "travel", "flights.json");
const TICKETS_PATH = path.join(process.cwd(), "data", "travel", "flight_tickets.json");

let _flights: Flight[] | null = null;
let _tickets: FlightTicket[] | null = null;

export async function loadFlights(): Promise<Flight[]> {
  if (!_flights) {
    const raw = await fs.readFile(FLIGHTS_PATH, "utf8");
    _flights = JSON.parse(raw) as Flight[];
  }
  return _flights;
}

export async function loadTickets(): Promise<FlightTicket[]> {
  if (!_tickets) {
    const raw = await fs.readFile(TICKETS_PATH, "utf8");
    _tickets = JSON.parse(raw) as FlightTicket[];
  }
  return _tickets;
}

export async function getFlightById(id: string): Promise<Flight | null> {
  const flights = await loadFlights();
  return flights.find((f) => f.flight_id === id) ?? null;
}
