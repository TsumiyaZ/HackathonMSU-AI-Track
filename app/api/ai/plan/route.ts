import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { prompt, preferences } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash since 1.5 is deprecated
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 1. Data Minimization (Query DB)
    // To prevent Context Window bloat, we take a limited set or filter by keywords if needed.
    const hotels = await prisma.hotel.findMany({ take: 30 });
    const flights = await prisma.flight.findMany({ take: 30 });
    const restaurants = await prisma.restaurant.findMany({ take: 30 });

    // 2. Prepare System Prompt & Context
    const systemInstruction = `
      You are an expert AI Travel Architect. 
      Your task is to create a detailed travel itinerary based on the user's prompt. 
      CRITICAL RULE: You MUST ONLY select flights, hotels, and restaurants from the provided "Available Data" below. Do not hallucinate places.
      CRITICAL RULE: Return ONLY a valid JSON object. No markdown formatting, no backticks, no explanations.
      
      User Prompt: "${prompt}"
      User Preferences: ${JSON.stringify(preferences || {})}
      
      --- Available Data (Use ONLY these) ---
      HOTELS: ${JSON.stringify(hotels.map(h => ({ id: h.hotel_id, name: h.name, price: h.price_per_night, location: h.location, rating: h.rating })))}
      FLIGHTS: ${JSON.stringify(flights.map(f => ({ id: f.flight_id, airline: f.airline, price: f.price, origin: f.origin, dest: f.destination, time: f.departure_time })))}
      RESTAURANTS: ${JSON.stringify(restaurants.map(r => ({ id: r.res_id, name: r.name, rating: r.rating, cuisine: r.cuisine })))}
      ---------------------------------------
      
      JSON Structure to Output:
      {
        "destination": "Name of destination (e.g., Phuket)",
        "days": Number (e.g., 3),
        "totalPrice": Number (Sum of all items),
        "items": [
          {
            "id": "uuid or unique string",
            "type": "flight", // must be 'flight', 'hotel', 'food', or 'activity'
            "time": "08:00 AM (or Day 1 - 08:00 AM)",
            "title": "Title of the activity in THAI",
            "description": "Short description in THAI",
            "price": Number, // CRITICAL: If exact price is not provided in data (e.g., restaurants, activities), you MUST ESTIMATE a realistic price in THB (e.g. 200-1500). NEVER return 0.
            "data": {} // Insert the raw matched object (e.g. hotel_id, flight_id) so UI can use it
          }
        ],
        "sentimentSummary": "A brief AI summary in THAI of why this trip is great and matches their preferences"
      }
      CRITICAL RULE: All text content (destination, title, description, sentimentSummary) MUST be written in the THAI language.
      CRITICAL RULE: NEVER output 0 for price. If a price is missing, use your world knowledge to estimate a realistic price in THB.
    `;

    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    
    // 3. Structured Output Parsing
    // Clean up markdown json tags if Gemini includes them
    const jsonStr = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const itinerary = JSON.parse(jsonStr);

    itinerary.id = `trp-${Date.now()}`;
    
    return NextResponse.json({ success: true, itinerary });
  } catch (error: any) {
    console.error('AI Planning Error:', error);
    // 4. Error Handling & Fallbacks (As per requirement 7.5)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "AI Error",
      fallback: {
        id: "trp-fallback",
        destination: "ภูเก็ต (แผนสำรอง)",
        days: 3,
        totalPrice: 15000,
        items: [],
        sentimentSummary: "ระบบขัดข้องชั่วคราว นี่คือแผนการเดินทางสำรอง"
      }
    }, { status: 500 });
  }
}
