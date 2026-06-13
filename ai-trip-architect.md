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
*   **Backend (Data & AI Layer):** 
    *   **Next.js Route Handlers (`app/api/...`):** สร้าง API ในตัวเพื่ออ่านข้อมูลจากโฟลเดอร์ `data/` โดยตรง ไม่ต้องพึ่ง Express
    *   **Google Gemini API (Free Tier)[cite: 1]:** รับข้อมูล JSON ที่ผ่านการคัดกรองแล้วไปประมวลผลจัดทริปและวิเคราะห์ Sentiment 

---

## 🗂️ 3. เจาะลึกฟีเจอร์หลักและการผสานข้อมูล (Core Features & Data Synergy)

โปรเจกต์นี้จะดึงข้อมูลจากไฟล์ JSON ต่างๆ มาสร้างเป็น Ecosystem ที่สมบูรณ์แบบดังนี้:

### ✨ Feature A: 1-Click Smart Itinerary (AI จัดทริปอัจฉริยะ)
ผู้ใช้พิมพ์ความต้องการ เช่น *"ไปภูเก็ต 3 วัน งบ 15,000 บาท"*
*   **Data Used:** 
    *   `flights.json`[cite: 10]: AI เลือกเที่ยวบินที่คุ้มค่าที่สุด (เช่น `fl-002` ไป HKT ราคา 1500)
    *   `hotels.json`[cite: 4]: AI กรองโรงแรมในพื้นที่ที่ตรงกับ Lifestyle (เช่น `h-002` มี Pool และ Beach Access)
    *   `restaurants.json`[cite: 12]: AI เลือกร้านอาหารที่เวลาส่ง/ระยะทางเหมาะสม
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

---

## 🗺️ 4. เจอร์นีย์ผู้ใช้และการไหลของระบบ (User Journey & Flow)

1.  **Welcome & Overview:** ผู้ใช้เข้าเว็บมาเจอหน้า Dashboard สรุปทริปเก่าๆ (ดึงจาก Bookings & Tickets)[cite: 5, 11]
2.  **Prompt Interaction:** ผู้ใช้กดปุ่มสร้างทริปใหม่ และกรอก Prompt ลงในช่องแชทของระบบ
3.  **Next.js API Processing:** 
    *   ระบบฝั่ง Server อ่านไฟล์ JSON ค้นหา Keyword (เช่น "ภูเก็ต")
    *   ส่งโครงสร้างข้อมูล (Flights, Hotels) เฉพาะภูเก็ตไปให้ Gemini พร้อม Prompt
4.  **AI Generation:** ระหว่างรอ หน้าเว็บแสดงแอนิเมชัน Loading (ระบบกำลังวิเคราะห์ข้อมูลนับพันรายการ...)
5.  **Review & Customize:** แสดงผลทริปเป็นแพ็กเกจ ผู้ใช้ดูข้อมูลสรุปงบประมาณและคำเตือนจาก AI (Sentiment Analysis)
6.  **Confirm Action:** กดยืนยันการจอง ระบบยิง Notification มุมจอแบบ Real-time[cite: 7] พร้อมโชว์แผนที่เส้นทาง (Locations)[cite: 8]

---

## 🏆 5. กลยุทธ์การพิชิตคะแนน Hackathon (Rubric Strategy)

*   **1. Innovation (25 pts)[cite: 1]:** ทะลุกรอบด้วยการทำ Cross-vertical bundle (จัดทริป) ไม่ใช่แค่ทำหน้า CRUD ธรรมดา
*   **2. UI/UX (25 pts)[cite: 1]:** ใช้ Next.js + Tailwind สไตล์ Glassmorphism ให้ความรู้สึกเป็น AI App ยุคใหม่ 
*   **3. Data Handling (20 pts)[cite: 1]:** ใช้ Route Handlers ควบคุม JSON 10 โฟลเดอร์ ส่ง Context ให้ AI อย่างชาญฉลาด ไม่ให้ Context Window ทะลุ
*   **4. Performance (15 pts)[cite: 1]:** Next.js Server Components รับประกันคะแนน Lighthouse >= 90 แน่นอน
*   **5. Completeness (15 pts)[cite: 1]:** มี Dashboard, กราฟ, List/Search และ Detail Page ครบเป๊ะตามกติกา
*   **🎁 Bonus (+10 pts)[cite: 1]:** เก็บโบนัสเรียบด้วย Gemini AI (Integration), แจ้งเตือนแบบ Real-time Simulation และทำ Sentiment Insight จาก Review