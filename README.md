# 🚀 AI Trip Architect - Navigating the Nebula

ยินดีต้อนรับสู่โปรเจกต์ **AI Trip Architect** แอปพลิเคชันจัดทริปการเดินทางอัจฉริยะด้วยเทคโนโลยี AI (Google Gemini) และฐานข้อมูลประสิทธิภาพสูง (Supabase + Prisma) สำหรับงาน Hackathon!

---

## 🛠️ การติดตั้งและรันโปรเจกต์ (Setup Guide)

หากคุณเพิ่ง Pull โค้ดมาจาก GitHub กรุณาทำตามขั้นตอนด้านล่างนี้ **ทีละขั้นตอน** เพื่อให้ระบบ AI และฐานข้อมูลทำงานได้อย่างสมบูรณ์

### 1. ติดตั้ง Dependencies (สำคัญมาก)
โปรเจกต์นี้ใช้ Next.js 15, Prisma และ Tailwind CSS พร้อมไลบรารี UI และ state management ต่างๆ:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (.env)
สร้างไฟล์ชื่อ `.env` หรือ `.env.local` ไว้ที่โฟลเดอร์นอกสุดของโปรเจกต์ แล้วใส่ข้อมูลดังนี้:

```env
# ฐานข้อมูล PostgreSQL (Supabase Connection Pooler)
DATABASE_URL="postgresql://postgres.[YOUR-SUPABASE-ID]:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# สำหรับการทำ Migrations / Seed (Direct Connection)
DIRECT_URL="postgresql://postgres.[YOUR-SUPABASE-ID]:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Google Gemini AI Key
GEMINI_API_KEY="ใส่_API_KEY_ของคุณที่นี่"
```

### 3. อัปเดตโครงสร้างฐานข้อมูล (Prisma)
1. **เตรียมฐานข้อมูลและเชื่อมโยง schema**:
   ```bash
   npx prisma generate
   ```
2. **สร้าง/ซิงค์ Table เข้าสู่ฐานข้อมูลจริง (ถ้าฐานข้อมูลเป็นแบบว่างเปล่า)**:
   ```bash
   npx prisma db push
   ```

### 4. ซี้ดข้อมูลทดสอบลงในฐานข้อมูล (Seed Database)
โปรเจกต์มีสคริปต์สำหรับใส่ข้อมูลเที่ยวบิน โรงแรม ร้านอาหาร และข้อมูลจำลองอื่นๆ เพื่อให้สามารถใช้งานหน้าค้นหา ทริป และ Dashboard ได้ทันที:
```bash
npm run db:seed
```

### 5. รันโปรเจกต์
เมื่อติดตั้งทุกอย่างเสร็จสิ้น สามารถรัน Development Server ได้เลย:
```bash
npm run dev
```
จากนั้นเปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์เพื่อเริ่มใช้งาน!

---

## 📋 เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend**: React 19, Next.js 15 (App Router with Turbopack)
* **Styling**: Tailwind CSS & PostCSS
* **Database & ORM**: Supabase (PostgreSQL) + Prisma ORM (พร้อม `@prisma/adapter-pg` driver)
* **AI Engine**: Google Gemini API via `@google/generative-ai`
* **State Management**: Zustand
* **Icons & Charts**: Lucide React & Recharts

---

## ⚠️ ปัญหาที่พบบ่อย (Troubleshooting)

**Q: เกิด Error `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` ตอนให้ AI จัดทริป**
* **สาเหตุ**: หน้าบ้าน (Frontend) ได้รับหน้าจอ Error ของ Next.js (เป็น HTML) แทนที่จะเป็นข้อมูลทริป (JSON) เนื่องจาก API ฝั่งหลังบ้านขัดข้อง
* **วิธีแก้**:
  1. ปิดเซิร์ฟเวอร์ก่อน (`Ctrl + C`)
  2. ตรวจสอบให้แน่ใจว่าได้ใส่ค่า `GEMINI_API_KEY` ในไฟล์ `.env` เรียบร้อยแล้ว
  3. เช็คสถานะการเชื่อมต่อฐานข้อมูลโดยการตรวจสอบ `DATABASE_URL` ในไฟล์ `.env`
  4. รัน `npx prisma generate` ใหม่เพื่อรีเฟรช Prisma Client
  5. รัน `npm run dev` ใหม่อีกครั้ง

**Q: ลิงก์ฟอนต์ภาษาไทยหรือฟอนต์ภายนอกมีคำเตือนเตือนใน ESLint ตอน Build**
* **สาเหตุ**: ESLint ตรวจจับการใช้ Custom Font ที่อยู่นอกไฟล์ `_document.js` ซึ่งปัจจุบันถูกผ่อนปรนกฎ (Relaxed Rule) ใน `eslint.config.mjs` แล้วให้แสดงเป็นเพียง Warning เพื่อความรวดเร็วในการพัฒนา

---
*Built with ❤️ for AI Hackathon*
