import { NextResponse } from 'next/server';
import { searchLocations, getLocationsByType } from '@/lib/locations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ answer: 'กรุณาพิมพ์คำถามเกี่ยวกับสถานที่หรือการเดินทาง' });
    }

    const q = query.toLowerCase();

    // Rule-based responses for Travel Buddy
    if (q.includes('โรงแรม') || q.includes('hotel') || q.includes('ที่พัก')) {
      const hotels = await getLocationsByType('HOTEL');
      const list = hotels.slice(0, 5).map(h => `• ${h.name} (${h.address})`).join('\n');
      return NextResponse.json({
        answer: `📌 พิกัดโรงแรมใกล้คุณ:\n${list || 'ไม่พบข้อมูลโรงแรม'}\n\nสามารถดูรายละเอียดเพิ่มเติมได้ที่หน้า "Explore → โรงแรม"`
      });
    }

    if (q.includes('ร้านอาหาร') || q.includes('กิน') || q.includes('อาหาร') || q.includes('restaurant')) {
      const restaurants = await getLocationsByType('RESTAURANT');
      const list = restaurants.slice(0, 5).map(r => `• ${r.name} (${r.address})`).join('\n');
      return NextResponse.json({
        answer: `🍽️ ร้านอาหารแนะนำ:\n${list || 'ไม่พบข้อมูลร้านอาหาร'}\n\nสามารถดูรายละเอียดเพิ่มเติมได้ที่หน้า Explore`
      });
    }

    if (q.includes('เที่ยว') || q.includes('tourist') || q.includes('สถานที่') || q.includes('ที่เที่ยว')) {
      const attractions = await getLocationsByType('ATTRACTION');
      const list = attractions.slice(0, 5).map(a => `• ${a.name} (${a.address})`).join('\n');
      return NextResponse.json({
        answer: `📍 สถานที่ท่องเที่ยวแนะนำ:\n${list || 'ไม่พบข้อมูลสถานที่ท่องเที่ยว'}\n\nคุณสามารถเพิ่มสถานที่เหล่านี้ในแผนการเดินทางของคุณได้!`
      });
    }

    if (q.includes('hospital') || q.includes('โรงพยาบาล') || q.includes('หมอ') || q.includes('พยาบาล')) {
      const hospitals = await getLocationsByType('HOSPITAL');
      const list = hospitals.slice(0, 5).map(h => `• ${h.name} (${h.address}) — เปิด ${h.operating_hours}`).join('\n');
      return NextResponse.json({
        answer: `🏥 โรงพยาบาลใกล้คุณ:\n${list || 'ไม่พบข้อมูลโรงพยาบาล'}`
      });
    }

    // Search by keyword in locations
    const results = await searchLocations(query);
    if (results.length > 0) {
      const list = results.slice(0, 5).map(r => `• ${r.name} (${r.type}) — ${r.address}`).join('\n');
      return NextResponse.json({
        answer: `🔍 ผลการค้นหาสำหรับ "${query}":\n${list}`
      });
    }

    // General response
    return NextResponse.json({
      answer: `ขอบคุณสำหรับคำถาม! "${query}"\n\nฉันสามารถช่วยคุณค้นหา:\n• 🏨 โรงแรมและที่พัก\n• 🍽️ ร้านอาหาร\n• 🏥 โรงพยาบาล\n• 📍 สถานที่ท่องเที่ยว\n\nกรุณาพิมพ์คำถามที่เฉพาะเจาะจงมากขึ้น เช่น "หาโรงแรมในภูเก็ต" หรือ "ร้านอาหารใกล้ฉัน"`
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      answer: 'ขออภัย เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง'
    });
  }
}
