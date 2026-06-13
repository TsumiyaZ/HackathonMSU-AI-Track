# 🚀 AI Trip Architect - Navigating the Nebula

ยินดีต้อนรับสู่โปรเจกต์ **AI Trip Architect** แอปพลิเคชันจัดทริปการเดินทางอัจฉริยะด้วยเทคโนโลยี AI (Google Gemini) และฐานข้อมูลประสิทธิภาพสูง (Supabase + Prisma) สำหรับงาน Hackathon!

## 🛠️ การติดตั้งและรันโปรเจกต์ (Setup Guide)

หากคุณเพิ่ง Pull โค้ดมาจาก GitHub กรุณาทำตามขั้นตอนด้านล่างนี้ **ทีละขั้นตอน** เพื่อให้ระบบ AI และฐานข้อมูลทำงานได้อย่างสมบูรณ์

### 1. ติดตั้ง Dependencies (สำคัญมาก)
เนื่องจากโปรเจกต์มีการใช้ไลบรารีใหม่ๆ (เช่น AI, Themes) คุณต้องติดตั้งแพ็กเกจทั้งหมดก่อน:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (.env)
คุณต้องมีคีย์สำหรับเชื่อมต่อฐานข้อมูล (Supabase) และ Gemini AI 
1. สร้างไฟล์ชื่อ `.env` ไว้ที่โฟลเดอร์นอกสุดของโปรเจกต์
2. คัดลอกข้อความด้านล่างนี้ไปใส่ในไฟล์ `.env` (ขอ API Key จากเพื่อนในทีม):

```env
# ฐานข้อมูล PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres.[YOUR-SUPABASE-ID]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-SUPABASE-ID]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Google Gemini AI Key
GEMINI_API_KEY="ใส่_API_KEY_ของคุณที่นี่"
```

### 3. อัปเดตโครงสร้างฐานข้อมูล (Prisma)
หลังจากใส่ `.env` เสร็จแล้ว ต้องทำให้ระบบรู้จักตารางในฐานข้อมูลของเราก่อน:
```bash
npx prisma generate
```
*(หากฐานข้อมูลยังไม่มีตาราง ให้ใช้คำสั่ง `npx prisma db push` แทน)*

### 4. รันโปรเจกต์
เมื่อติดตั้งทุกอย่างเสร็จสิ้น สามารถรัน Development Server ได้เลย:
```bash
npm run dev
```
จากนั้นเปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์เพื่อเริ่มใช้งาน!

---

## ⚠️ ปัญหาที่พบบ่อย (Troubleshooting)

**Q: เกิด Error `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` ตอนให้ AI จัดทริป**
**A:** ปัญหานี้เกิดจากการที่หน้าบ้าน (Frontend) ได้รับหน้าจอ Error ของ Next.js (เป็น HTML) แทนที่จะเป็นข้อมูลทริป (JSON) 
วิธีแก้: 
1. ปิดเซิร์ฟเวอร์ก่อน (`Ctrl + C`)
2. เช็คให้แน่ใจว่าทำขั้นตอนที่ 1 (`npm install`) และขั้นตอนที่ 3 (`npx prisma generate`) ครบถ้วนแล้ว
3. เช็คไฟล์ `.env` ว่าค่า `GEMINI_API_KEY` ถูกต้อง
4. รัน `npm run dev` ใหม่อีกครั้ง

---
*Built with ❤️ for AI Hackathon*
