# บันทึก Bug CHECK.md

> สร้าง: 14 มิ.ย. 2026  
> แก้ไขล่าสุด: 15 มิ.ย. 2026  
> ตรวจสอบโดย: code review + `npx tsc --noEmit` + `npm run build`  
> Build result: **PASS** (0 error)

---

## 🔴 High (ควรแก้ทันที)

### 1. ~~booking detail — แสดง guest count แทน check-in/out date~~ ✅ FIXED
**File:** `app/(app)/bookings/[id]/page.tsx:239-241`  
**Fix:** เปลี่ยนจาก `{booking.guests}` → `{checkInStr} → {checkOutStr}` ✅

### 2. ~~restaurant list — "ดูรายละเอียด" button ไม่มี action~~ ✅ FIXED
**File:** `app/(app)/explore/restaurants/page.tsx:44-46`  
**Fix:** เปลี่ยน `<button>` → `<Link href={/explore/restaurant/${res.res_id}}>` ✅

### 3. ~~restaurant detail — back link ผิด path~~ ✅ FIXED
**File:** `app/(app)/explore/restaurant/[id]/page.tsx:24`  
**Fix:** เปลี่ยน `/explore/hotels` → `/explore/restaurants` ✅

### 4. ~~profile page — fallback login fetch ใช้ผิด endpoint~~ ✅ FIXED
**File:** `app/(app)/profile/page.tsx:87-98`  
**Note:** แก้แล้วระหว่าง migration — ใช้ `/api/auth/check-session` ถูกต้องแล้ว ✅

---

## 🟡 Medium

### 5. help page — unused import `Link`
**File:** `app/(app)/help/page.tsx:1`  
**Bug:** `import Link from "next/link"` แต่ไม่เคยใช้ใน JSX (ใช้แค่ `<a>` + `<button>`)  
**Fix:** ลบ import

### 6. API plan route — biased shuffle
**File:** `app/api/ai/plan/route.ts:94`  
**Bug:** `sort(() => Math.random() - 0.5)` ไม่ uniform  
**Fix:** ใช้ Fisher-Yates shuffle

### 7. API plan route — memory leak (missing AbortController)
**File:** `app/api/ai/plan/route.ts:231`  
**Bug:** `Promise.race` timeout ไม่มี `AbortController` → Gemini request ทำงานต่อหลัง timeout  
**Fix:** ใช้ `AbortController` + `signal` ใน Gemini fetch

### 8. API plan route — กลืน error เงียบ
**File:** `app/api/ai/plan/route.ts:234`  
**Bug:** `catch { }` โดยไม่ log หรือ fallback  
**Fix:** อย่างน้อย `console.error()` และ return fallback response

### 9. API alternatives — random price ไม่ consistent
**File:** `app/api/alternatives/route.ts:42`  
**Bug:** random price ทุก request → client เก็บ cache ไม่ได้  
**Fix:** deterministic price จากข้อมูลจริง

### 10. API bookings — merge logic ticket/flight ผิดลำดับ
**File:** `app/api/bookings/route.ts:26-34`  
**Bug:** merge booking กับ flight ticket โดยไม่เรียง flight_id → อาจเอาผิด flight  
**Fix:** เรียงตาม `flight_id` ก่อน merge

---

## 🟢 Low / Warning

| # | File | Issue |
|---|------|-------|
| 11 | `app/api/admin/stats/route.ts:33` | `sort` โดย `b.check_in` อาจเป็น `undefined` → crash |
| 12 | `app/api/auth/register/route.ts:18` | ไม่เช็ค phone ซ้ำ, ไม่ validate email |
| 13 | `app/api/alternatives/route.ts:13` | unused variable `let alternatives = []` |
| 14 | `app/api/reviews/sentiment/route.ts` | ไม่มี try-catch → network error = 500 |
| 15 | `app/api/weather/route.ts` | API key หมดอายุ — ควรมี static fallback |

---

## ✅ Things ที่ตรวจแล้ว OK

| File | Status |
|------|--------|
| All 15 API routes | ✅ ตรวจแล้ว (มีบั๊กตามตารางบน) |
| middleware.ts | ✅ protect `/admin` ถูก |
| lib/hotels.ts (284 บรรทัด) | ✅ ใช้ JSON + rule-based sentiment ไม่มี AI call |
| lib/store.ts | ✅ Zustand store ถูก |
| components/DirectBookButton.tsx | ✅ client component ปกติ ไม่ใช่ async |
| All imports ใน 12 ไฟล์ | ✅ resolve ครบ |
| TypeScript compile (`tsc --noEmit`) | ✅ 0 error |
| Next.js build | ✅ 0 error |

---

## Notes

- **Hotels page Suspense**: `HotelFilters` (client) ใช้ `useSearchParams()` ใน server component → ควรมี `<Suspense>` ห่อ ถึง build จะผ่าน
- **API plan route**: แนะนำให้ใช้ `AbortController` และเพิ่ม rate limiting ถ้าคาดว่าจะมี load สูง
- **Bookings**: ต้องตรวจสอบว่า `/bookings/h-[id]` path ตรงกับ API route `/api/bookings?id=...`
