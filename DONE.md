# Done

## Phase 1 — JSON Migration (Prisma → JSON)
- [x] สร้าง `lib/json-db.ts` — utility `readJSON/writeJSON` กลาง
- [x] Rewrite `lib/users.ts` — ใช้ JSON แทน Prisma CRUD
- [x] สร้าง `lib/bookings.ts` — JSON-based hotel booking + flight ticket CRUD
- [x] แก้ API routes ทั้ง 6 ไฟล์ (checkout, bookings, admin/hotels, admin/stats, admin/users, alternatives)
- [x] แก้ Pages ทั้ง 4 ไฟล์ (bookings, bookings/[id], explore, restaurants)
- [x] ลบ Prisma: `lib/prisma.ts`, `prisma/`, `prisma.config.ts`, cleanup `package.json`
- [x] Build ผ่าน 0 error, Deploy ไป Vercel สำเร็จ

## Phase 2 — Bug Fixes
- [x] Booking detail: แสดง check-in/out date แทน guest count
- [x] Restaurant list: "ดูรายละเอียด" button → `<Link>`
- [x] Restaurant detail: back link `/explore/hotels` → `/explore/restaurants`
- [x] Profile page: fallback login fetch (แก้แล้วตั้งแต่ migration)

## Phase 3 — Optimization
- [x] In-memory cache `readJSON()` (Map, TTL 5s)
- [x] Parallel reads: `getHotelBookingById`, `getFlightTicketById` (Promise.all)
- [x] Parallel reads: explore page (Promise.all 3 data sources)
- [x] Batch read: checkout API (อ่าน flights/hotels ครั้งเดียวก่อน loop)
- [x] EROFS fallback: `/tmp/data/` สำหรับ Vercel read-only filesystem
- [x] Error message detail ใน checkout page

## Phase 4 — Real-time Simulation
- [x] SSE endpoint `/api/sse` — push events ทุก 8-15 วิ
- [x] `useEventSource` hook — client-side SSE consumer
- [x] `RealtimeToast` component — toast แสดงทุกหน้า (bottom-right)
- [x] Live Activity Feed ใน Admin Dashboard + connection status indicator

## Phase 5 — UI Upgrade (Explore Page)
- [x] Header: `text-4xl md:text-6xl`, spacing เพิ่ม
- [x] Category cards: `rounded-3xl`, `min-h-[180px]`
- [x] Hotel cards: รูปใหญ่ขึ้น (`h-44`), แสดง stars + amenities, hover effect
- [x] Restaurant cards: เพิ่ม description, rating pill, link wrapper
- [x] Flight cards: `rounded-2xl`, route gradient line, ราคาใหญ่ขึ้น
- [x] Home hotel cards: เพิ่ม `glass-panel` + border frame

## Deployed
- URL: https://hackathonmsu-ai-track.vercel.app
- Stack: Next.js 15.5.19, JSON data, Tailwind CSS, Gemini AI
