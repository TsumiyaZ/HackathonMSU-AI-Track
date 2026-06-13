# AI Trip Architect: Smart Itinerary & Booking Synergy Platform (Next.js Edition)

## 📌 1. บทสรุปแนวคิด (Concept Summary)
**"AI Trip Architect"** คือสุดยอดแพลตฟอร์มผู้ช่วยวางแผนการเดินทางอัจฉริยะ ที่ออกแบบมาเพื่อทลายข้อจำกัดของการจองทริปแบบเดิมๆ โปรเจกต์นี้ดึงศักยภาพของการทำ **Cross-Vertical Integration** โดยผสานข้อมูลจาก 4 อุตสาหกรรมหลัก ได้แก่ การเดินทาง (Travel), โรงแรม (Hotel), อาหาร (Food) และข้อมูลส่วนกลาง (Common Data) เข้าด้วยกัน

ด้วยขุมพลังของ Generative AI (Google Gemini)[cite: 1] ระบบสามารถรับคำสั่งผ่านภาษาธรรมชาติ (Prompt) เพื่อวิเคราะห์ความคุ้มค่า จัดตารางเวลา สรุปรีวิว และพยากรณ์งบประมาณออกมาเป็น "แผนการเดินทางที่ Personalize แบบ 1-Click" พร้อมจำลองระบบแจ้งเตือนแบบ Real-time[cite: 1] ตอบโจทย์วิถีชีวิตคนยุคใหม่ที่ต้องการความสะดวก รวดเร็ว และฉลาดล้ำหน้า

---

## 🛠️ 2. สถาปัตยกรรมระบบ (Technical Stack & Architecture)
การเลือกใช้ Next.js ทำให้เราสามารถสร้างระบบแบบ Full-Stack ได้ใน Repository เดียว ช่วยให้ทำงานได้ไวและทำคะแนน Performance (Lighthouse ≥ 90) ได้อย่างง่ายดาย[cite: 1]

*   **Frontend (UI/UX):** 
    *   **Next.js (App Router):** ใช้ React Server Components (RSC) เพื่อเรนเดอร์หน้าเว็บให้โหลดไวสุดๆ
    *   **Tailwind CSS + Framer Motion:** ออกแบบ UI สไตล์ Glassmorphism ให้ดูทันสมัย (Living App) พร้อมแอนิเมชันที่ลื่นไหล
    *   **Recharts / Chart.js:** สำหรับทำ Dashboard สรุปงบประมาณและภาพรวมการจอง
    *   **Zustand / Redux Toolkit:** จัดการ Global State ข้ามหน้าเว็บ (เช่น จัดการทริปจาก /plan ไปยัง /checkout)
*   **Backend (Data & AI Layer):** 
    *   **Next.js Route Handlers (`app/api/...`):** สร้าง API ในตัวเพื่อเป็นตัวกลางในการคุยกับ Database และ AI
    *   **Supabase (PostgreSQL):** ใช้เป็น Database หลักของระบบ (ไฟล์ `data/*.json` ในโปรเจกต์จะเป็นเพียง Seed Data สำหรับนำเข้า Database ในตอนแรกเท่านั้น) ทำให้สามารถบันทึก/อ่านข้อมูลได้อย่างสมบูรณ์เมื่อ Deploy
    *   **Google Gemini API (Free Tier)[cite: 1]:** รับข้อมูลที่ Query จาก Supabase ไปประมวลผลจัดทริปและวิเคราะห์ Sentiment 

---

## 🗂️ 3. เจาะลึกฟีเจอร์หลักและการผสานข้อมูล (Core Features & Data Synergy)

โปรเจกต์นี้จะดึงข้อมูลข้ามหมวดหมู่จาก Supabase (ที่อ้างอิงโครงสร้างจากไฟล์ JSON) มาสร้างเป็น Ecosystem ที่สมบูรณ์แบบดังนี้:

### ✨ Feature A: 1-Click Smart Itinerary (AI จัดทริปอัจฉริยะ)
ผู้ใช้พิมพ์ความต้องการ เช่น *"ไปภูเก็ต 3 วัน งบ 15,000 บาท"*
*   **Data Used:** 
    *   `flights.json`[cite: 10]: AI เลือกเที่ยวบินที่คุ้มค่าที่สุด (เช่น `fl-002` ไป HKT ราคา 1500)
    *   `hotels.json`[cite: 4]: AI กรองโรงแรมในพื้นที่ที่ตรงกับ Lifestyle (เช่น `h-002` มี Pool และ Beach Access)
    *   `restaurants.json`[cite: 12]: AI เลือกร้านอาหารที่เวลาเปิด-ปิด (Operating Hours) และระยะทางสอดคล้องกับแพลน (Dine-in)
*   **Output:** นำเสนอเป็น Interactive Timeline ผู้ใช้สามารถกดสลับเปลี่ยนเที่ยวบินหรือโรงแรมได้ทันที

### 📊 Feature B: Financial & Booking Dashboard (หน้าปัดสรุปข้อมูล)
ทำตาม Requirement ขั้นต่ำอย่างครบถ้วน[cite: 1]
*   **Data Used:** `hotel_bookings.json`[cite: 5] และ `flight_tickets.json`[cite: 11]
*   **Output:** 
    *   กราฟวงกลม (Pie Chart) เปรียบเทียบสัดส่วนค่าตั๋วบิน vs ค่าที่พัก 
    *   ตาราง List & Search ที่สามารถค้นหาและ Filter สถานะตั๋ว (เช่น `BOARDED`, `ISSUED`, `CANCELLED`)[cite: 11]

### 🧠 Feature C: AI Sentiment Insight (สรุปรีวิวจาก AI)
*   **Data Used:** `reviews.json`[cite: 6]
*   **Output:** ก่อนที่ผู้ใช้จะกดจองโรงแรม AI จะสกัดข้อมูลจากรีวิวหลายๆ อันมาสรุปสั้นๆ เช่น *"จุดเด่น: สระว่ายน้ำสวย (80%), ข้อควรระวัง: แอร์อาจไม่เย็นในบางห้องอ้างอิงจากรีวิวผู้ใช้"* 

### 🔔 Feature D: Post-Booking & Real-time Assistant (จำลองเหตุการณ์หลังจอง)
โชว์ฟีเจอร์เพื่อเก็บคะแนน Bonus (Realtime & Insight)[cite: 1]
*   **Data Used:** `notifications.json`[cite: 7], `chats.json`[cite: 9], และ `locations.json`[cite: 8]
*   **Output:** 
    *   เมื่อกดจองสำเร็จ มี Toast Notification เด้งเตือนทันที (จำลองจาก `nf-006` เตือนตั๋วพร้อม)[cite: 7]
    *   ฟีเจอร์ **"Travel Buddy"** แชทบอทจำลองที่ให้ผู้ใช้พิมพ์ถามพิกัดสถานที่ (`locations.json`[cite: 8]) หรือแผนการเดินทางได้

### 👤 Feature E: Personalization & User Context (ปรับแต่งทริปตามใจผู้ใช้)
ผู้ใช้สามารถตั้งค่าความชอบส่วนตัว (Preferences) ก่อนให้ AI จัดทริป เพื่อให้ผลลัพธ์แม่นยำยิ่งขึ้น
*   **Data Used:** ข้อมูลจำลอง Profile ผู้ใช้ (เช่น ระดับงบประมาณ, อาการแพ้อาหาร, สไตล์ที่พักที่ชอบ)
*   **Output:** AI จะนำข้อมูล Profile เหล่านี้ไปผสานกับ Prompt อัตโนมัติ เพื่อคัดกรองโรงแรมและร้านอาหารให้ตรงใจผู้ใช้มากที่สุด โดยไม่ต้องพิมพ์คำสั่งยาวๆ

### 🗺️ Feature F: Interactive Route Map (แผนที่เส้นทางแบบเห็นภาพ)
เพื่อยกระดับ UI/UX ให้ดูเป็นมืออาชีพและใช้งานได้จริง
*   **Output:** นำพิกัดสถานที่จาก `locations.json` มาปักหมุดแสดงผลบน Interactive Map ในหน้า 1-Click Smart Itinerary เพื่อให้ผู้ใช้เห็นภาพรวมและระยะห่างระหว่างโรงแรม ร้านอาหาร และจุดท่องเที่ยว

### 🌤️ Feature G: Weather-Aware AI Planning (จัดทริปฉลาดรู้ใจสภาพอากาศ)
เสริมความฉลาด (Innovation) ให้กับ AI ในการเป็นผู้ช่วยวางแผนที่แท้จริง
*   **Data Used:** ข้อมูลพยากรณ์อากาศจำลอง (Mock Weather Data) ในจุดหมายปลายทาง
*   **Output:** AI ประเมินสภาพอากาศของวันเดินทางและปรับแผนให้เหมาะสม เช่น "เนื่องจากมีพยากรณ์ฝนตก AI จึงแนะนำให้เปลี่ยนแพลนช่วงบ่ายเป็นการเดินห้างหรือคาเฟ่ Indoor แทน"

### 📤 Feature H: Share & Export Itinerary (แชร์ทริปให้เพื่อนร่วมทาง)
เพิ่ม Completeness ให้กับโปรเจกต์
*   **Output:** สร้างปุ่มให้ผู้ใช้สามารถ "แชร์ทริป" เป็น Shareable Link (ใช้งานผ่าน Dynamic Routes ของ Next.js) หรือบันทึกหน้าสรุปแผนการเดินทางเก็บไว้ดูแบบออฟไลน์

---

## 🗺️ 4. เจอร์นีย์ผู้ใช้และการไหลของระบบ (User Journey & Flow)

1.  **Onboarding & Login:** ผู้ใช้เข้าสู่ระบบจำลอง (Mock Auth) เพื่อให้ระบบรู้จักตัวตนและดึง Preferences
2.  **Welcome & Overview:** ผู้ใช้เข้าสู่หน้า Dashboard สรุปทริปเก่าๆ (ดึงจาก Bookings & Tickets)[cite: 5, 11]
3.  **Prompt Interaction:** ผู้ใช้กดปุ่มสร้างทริปใหม่ และกรอก Prompt ลงในช่องแชทของระบบ
4.  **Next.js API Processing:** 
    *   ระบบฝั่ง Server Query ข้อมูลจากตารางใน Supabase ตาม Keyword (เช่น "ภูเก็ต")
    *   ส่งโครงสร้างข้อมูล (Flights, Hotels) เฉพาะภูเก็ตไปให้ Gemini พร้อม Prompt
5.  **AI Generation:** ระหว่างรอ หน้าเว็บแสดงแอนิเมชัน Loading (ระบบกำลังวิเคราะห์ข้อมูลนับพันรายการ...)
6.  **Review & Customize:** แสดงผลทริปเป็นแพ็กเกจ ผู้ใช้ดูข้อมูลสรุปงบประมาณและคำเตือนจาก AI (Sentiment Analysis)
7.  **Confirm Action:** กดยืนยันการจอง ระบบยิง Notification มุมจอแบบ Real-time[cite: 7] พร้อมโชว์แผนที่เส้นทาง (Locations)[cite: 8]

---

## 🧭 5. โครงสร้างหน้าเว็บ (UX/UI Page Routes)
เพื่อนำไปใช้ออกแบบ UX/UI ให้ครอบคลุมทุกฟีเจอร์และรองรับ Next.js App Router ระบบควรมีหน้า (Pages) ดังต่อไปนี้:

*   **0. `/auth/login` (หน้าเข้าสู่ระบบจำลอง)**
    *   **หน้าที่:** ให้ผู้ใช้ล็อกอินเพื่อดึงข้อมูล Personalization (User Context)
    *   **UI Components:** ฟอร์ม Login แบบเรียบง่าย (Mock Auth)
*   **1. `/` (หน้าแรก / Main Dashboard)**
    *   **หน้าที่:** แสดงภาพรวมของระบบ (Overview) และสถานะทริปปัจจุบัน
    *   **UI Components:** กราฟวงกลมสรุปสัดส่วนค่าใช้จ่าย, สรุปทริปที่กำลังจะมาถึง, และปุ่ม CTA ใหญ่ๆ "✨ สร้างทริปใหม่ด้วย AI"
*   **2. `/plan` (หน้าโต้ตอบและป้อนคำสั่ง AI)**
    *   **หน้าที่:** หน้าจอรับความต้องการ (Prompt Interaction)
    *   **UI Components:** ช่องแชทสำหรับพิมพ์ Prompt, ปุ่ม Preset (เช่น "เที่ยวทะเลงบประหยัด"), และหน้าจอ Loading Animation สุดล้ำระหว่างรอ AI
*   **3. `/trip/[id]` (หน้าสรุปแผนการเดินทาง - 1-Click Smart Itinerary)**
    *   **หน้าที่:** หน้าต่างแสดงผลลัพธ์ที่ AI จัดแพ็กเกจให้ (Review & Customize) สามารถกดปุ่ม Share/Export ทริปได้
    *   **UI Components:** 
        *   Interactive Timeline แบ่งตามวัน/เวลา
        *   Interactive Map ปักหมุดโรงแรมและสถานที่ (Feature F)
        *   กล่องคำแนะนำสภาพอากาศ (Weather Alert - Feature G)
*   **4. `/checkout` (หน้ายืนยันและชำระเงินจำลอง)**
    *   **หน้าที่:** สรุปยอดเงินและยืนยันการจอง 
    *   **UI Components:** สรุปยอดสุทธิ, ฟอร์มกรอกบัตรเครดิต/สแกน QR, เมื่อจ่ายเสร็จจะยิง Toast Notification อัตโนมัติ (Feature D)
*   **5. `/bookings` (หน้าจัดการประวัติการจองและตั๋ว)**
    *   **หน้าที่:** จัดการข้อมูลการจองทั้งหมด (ตอบโจทย์ Completeness: List/Search)
    *   **UI Components:** ตารางแสดงผลที่สามารถทำ Search, Sort, และ Filter ตามสถานะ (เช่น `BOARDED`, `CANCELLED`)
*   **6. `/explore` (หน้าแคตตาล็อกค้นหาด้วยตนเอง)**
    *   **หน้าที่:** หากผู้ใช้ไม่อยากใช้ AI ก็สามารถเลือกดู โรงแรม/เที่ยวบิน/ร้านอาหาร แบบ Manual ได้ (ตอบโจทย์ CRUD ขั้นพื้นฐาน)
    *   **UI Components:** Grid Layout แนะนำสถานที่พร้อมระบบ Filter
*   **7. `/explore/hotel/[id]`, `/explore/flight/[id]`, `/explore/restaurant/[id]` (หน้า Detail Pages)**
    *   **หน้าที่:** หน้ารายละเอียดของแต่ละบริการ (ตอบโจทย์ Completeness: Detail Page)
    *   **UI Components:** แกลเลอรีรูปภาพ, สิ่งอำนวยความสะดวก, และที่สำคัญคือ **"AI Sentiment Summary"** (Feature C) สรุปจุดเด่น/จุดด้อยจากรีวิว
*   **8. `/chat` (หน้า Travel Buddy Assistant)**
    *   **หน้าที่:** แชทบอทผู้ช่วยส่วนตัวระหว่างเดินทาง (Feature D)
    *   **UI Components:** หน้าต่างแชทที่สามารถดึงข้อมูลพิกัดจาก `locations.json` มาตอบได้แบบ Real-time
*   **9. `/profile` (หน้าจัดการข้อมูลส่วนตัว)**
    *   **หน้าที่:** ตั้งค่าความชอบส่วนตัวให้ AI รู้จัก (Feature E)
    *   **UI Components:** ฟอร์มตั้งค่าระดับงบประมาณ, ประเภทที่พักที่ชอบ, สายการบินที่สะสมไมล์, และข้อจำกัดด้านอาหาร

---

## 🏆 6. กลยุทธ์การพิชิตคะแนน Hackathon (Rubric Strategy)

*   **1. Innovation (25 pts)[cite: 1]:** ทะลุกรอบด้วยการทำ Cross-vertical bundle (จัดทริป) ไม่ใช่แค่ทำหน้า CRUD ธรรมดา
*   **2. UI/UX (25 pts)[cite: 1]:** ใช้ Next.js + Tailwind สไตล์ Glassmorphism ให้ความรู้สึกเป็น AI App ยุคใหม่ 
*   **3. Data Handling (20 pts)[cite: 1]:** ใช้ Supabase เป็นฐานข้อมูลจริง และผสานข้อมูล 4 หมวดหมู่อุตสาหกรรมผ่าน Route Handlers ก่อนส่ง Context ให้ AI อย่างชาญฉลาด ไม่ให้ Context Window ทะลุ
*   **4. Performance (15 pts)[cite: 1]:** Next.js Server Components รับประกันคะแนน Lighthouse >= 90 แน่นอน
*   **5. Completeness (15 pts)[cite: 1]:** มี Dashboard, กราฟ, List/Search และ Detail Page ครบเป๊ะตามกติกา
*   **🎁 Bonus (+10 pts)[cite: 1]:** เก็บโบนัสเรียบด้วย Gemini AI (Integration), แจ้งเตือนแบบ Real-time Simulation และทำ Sentiment Insight จาก Review

---

## ⚙️ 7. ข้อกำหนดทางเทคนิคเชิงลึก (Technical Specifications)

เพื่อความชัดเจนในการนำไปพัฒนาจริง (Development Phase) ได้กำหนดสเปคการทำงานเชิงลึกไว้ดังนี้:

### 7.1 โครงสร้าง API (API Endpoints & Payloads)
ใช้ Next.js Route Handlers เป็น Backend ตรงกลาง (เชื่อมต่อ Supabase):
*   `POST /api/ai/plan`: รับ Payload `{ prompt: string, preferences: object }` -> Server Query ข้อมูลจาก Supabase -> ยิงเข้า Gemini -> Return โครงสร้าง `JSON Itinerary` และ Save ลง Database
*   `GET /api/reviews/sentiment?targetId={id}`: ดึงรีวิวตาม ID จาก Supabase (ตาราง `reviews`) -> ส่งให้ Gemini วิเคราะห์ -> Return `{ summary: string, sentimentScore: number }`
*   `GET /api/bookings`: ดึงประวัติการจองของผู้ใช้จาก Supabase คืนค่าเป็น Array สำหรับทำหน้า List & Search

### 7.2 โครงสร้าง State Management (Zustand Schema)
ใช้ Zustand ในการสร้าง `useTripStore` เพื่อจัดการ Global State โดยไม่ต้อง Prop-drilling:
```typescript
interface TripState {
  currentTrip: Itinerary | null; // แผนทริปปัจจุบัน
  userPreferences: UserProfile | null; // ค่าที่ตั้งใน /profile
  setTrip: (trip: Itinerary) => void;
  swapActivity: (oldId: string, newId: string) => void; // สลับที่พัก/เที่ยวบิน
}
```

### 7.3 กลยุทธ์การสั่งงาน AI (Prompt Engineering Strategy)
*   **Context Optimization:** จะไม่โยน JSON ทั้งก้อนให้ Gemini เด็ดขาด แต่จะใช้ API กรองเฉพาะจุดหมายที่ User ระบุ (เช่น ภูเก็ต) และทำ Data Minimization (ตัดฟิลด์ที่ไม่จำเป็นทิ้ง) เพื่อประหยัด Token และป้องกัน Context Window ทะลุ
*   **Structured Output:** ใช้คำสั่ง System Prompt บังคับให้ Gemini คืนค่า (Return) กลับมาเป็นรูปแบบ `application/json` เท่านั้น เพื่อให้ Frontend นำไปเรนเดอร์ต่อได้ทันทีโดยไม่พัง

### 7.4 โครงสร้าง React Component (UI Hierarchy)
ออกแบบแบบ Reusable Components เพื่อความสะอาดของโค้ด:
*   `<TimelineCard />`: กล่องแสดงข้อมูลแต่ละกิจกรรมในแผนการเดินทาง (รับ Props เป็น Object)
*   `<SentimentBadge score={number} />`: ป้ายสีแสดงคะแนนรีวิวจาก AI (สีเขียว=ดี, สีแดง=ควรระวัง)
*   `<MockPaymentModal />`: หน้าต่าง Popup สำหรับจำลองการกรอกข้อมูลบัตรเครดิต
*   `<WeatherAlert condition={string} />`: Component แจ้งเตือนสภาพอากาศอัจฉริยะ

### 7.5 การรับมือข้อผิดพลาด (Error Handling & Fallbacks)
เรื่องสำคัญมากสำหรับการพรีเซนต์งาน Hackathon:
*   **AI Timeout / Rate Limit:** หากรอ Gemini เกิน 15 วินาที หรือติด Limit ระบบจะสลับไปดึงข้อมูล `fallback_itinerary.json` ที่เป็นแพลนสำรองแบบ Hardcode ทันที (ให้พรีเซนต์ต่อได้ลื่นไหล)
*   **JSON Parse Error:** หาก AI คืนค่าผิด Format จะมี Retry Logic เรียกซ้ำ 1 ครั้ง หากยังไม่ได้จะโชว์ Error UI แบบสุภาพ พร้อมปุ่ม "ลองใหม่อีกครั้ง"