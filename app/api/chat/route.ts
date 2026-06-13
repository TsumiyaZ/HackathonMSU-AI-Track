import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { loadLocations } from '@/lib/locations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ answer: 'กรุณาพิมพ์คำถามเกี่ยวกับสถานที่หรือการเดินทาง' });
    }

    // 2. Prepare API Key
    const apiKey = process.env.OPENCODE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: 'ระบบ AI ขัดข้อง: ไม่พบ API Key กรุณาติดต่อผู้ดูแลระบบ' });
    }

    // 1. Fetch available contextual data to ground the AI (Optimized: Parallel fetching + smaller context size)
    const [hotels, restaurants, flights, allLocations] = await Promise.all([
      prisma.hotel.findMany({ take: 10 }),
      prisma.restaurant.findMany({ take: 10 }),
      prisma.flight.findMany({ take: 10 }),
      loadLocations()
    ]);
    const generalLocations = allLocations.slice(0, 10);

    // 3. Construct System Prompt with Context
    const systemInstruction = `
      คุณคือ "Travel Buddy" 🧳 ผู้ช่วย AI ส่วนตัวสำหรับการท่องเที่ยวและจัดทริป 
      บุคลิกของคุณคือ: เป็นมิตร กระตือรือร้น สุภาพ คุยสนุก (สามารถใช้ Emoji น่ารักๆ ประกอบการสนทนาได้) และเป็นมืออาชีพ

      กฎสำคัญ:
      1. ตอบคำถามของลูกค้าโดยใช้ข้อมูลจาก "ฐานข้อมูลสถานที่ที่มีอยู่" ด้านล่างนี้เป็นหลัก
      2. หากลูกค้าถามหาสถานที่ โรงแรม ร้านอาหาร หรือเที่ยวบิน ให้พยายามแนะนำสิ่งที่ตรงกับในฐานข้อมูล หากไม่มีในฐานข้อมูล ให้ตอบตามความรู้ทั่วไปของคุณและแจ้งให้ลูกค้าทราบว่ายังไม่มีบริการจองผ่านระบบเรา
      3. ห้ามทำตัวแข็งทื่อแบบหุ่นยนต์ ให้จัดรูปแบบข้อความให้สวยงาม อ่านง่าย (เช่น ใช้ bullet points, ตัวหนา) 
      4. ตอบเป็นภาษาไทยเท่านั้น

      --- ฐานข้อมูลสถานที่ที่มีอยู่ (Context) ---
      โรงแรม: ${JSON.stringify(hotels.map(h => ({ ชื่อ: h.name, ราคาต่อคืน: h.price_per_night, สถานที่: h.location, คะแนน: h.rating })))}
      ร้านอาหาร: ${JSON.stringify(restaurants.map(r => ({ ชื่อ: r.name, ประเภทอาหาร: r.cuisine, คะแนน: r.rating })))}
      เที่ยวบิน: ${JSON.stringify(flights.map(f => ({ สายการบิน: f.airline, ต้นทาง: f.origin, ปลายทาง: f.destination, ราคา: f.price })))}
      สถานที่อื่นๆ (โรงพยาบาล, ที่เที่ยว): ${JSON.stringify(generalLocations.slice(0, 30).map(l => ({ ชื่อ: l.name, ประเภท: l.type, ที่อยู่: l.address })))}
      -----------------------------------------
    `;

    // 4. Generate Response using DeepSeek V4 Flash Free via OpenCode API
    const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash-free',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "ขออภัย ไม่ได้รับคำตอบจากระบบ";

    return NextResponse.json({ answer: text });
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      answer: 'ขออภัยครับ ตอนนี้ผม (Travel Buddy) กำลังมึนงงเล็กน้อยเนื่องจากระบบขัดข้อง 😅 รบกวนคุณลูกค้าลองพิมพ์ถามใหม่อีกครั้งนะครับ!'
    });
  }
}
