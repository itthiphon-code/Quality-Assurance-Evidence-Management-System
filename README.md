# QA-EMS — ระบบจัดเก็บหลักฐานประกันคุณภาพ

ระบบจัดเก็บข้อมูลการตรวจเยี่ยมสถานศึกษา (Quality-Assurance Evidence Management System) สำหรับวิทยาลัยเทคนิคอุบลราชธานี รองรับการประกันคุณภาพภายนอกด้านการอาชีวศึกษาโดย สมศ. รอบ พ.ศ. 2567–2571

> สถานะปัจจุบัน: **Phase 4 — รายงาน + เสริมความปลอดภัย + Deploy prep** (ส่งออกรายงาน PDF/Excel, validation/rate limiting เพิ่มเติม, เมนูมือถือ, Docker+Nginx สำหรับ production ทดสอบแล้วบนเครื่อง — ยังไม่ได้ deploy ขึ้นเซิร์ฟเวอร์จริง). ดูรายละเอียดแผนทั้งหมดที่ `BUILD_PROMPT.md`

## สถาปัตยกรรม

```
/
├── docker-compose.yml       # PostgreSQL + MinIO (dev)
├── docker-compose.prod.yml  # PostgreSQL + MinIO + backend + frontend/nginx (production)
├── nginx/nginx.conf         # reverse proxy: serves frontend, proxies /api/* ไปยัง backend
├── scripts/backup.sh        # สำรอง PostgreSQL + ไฟล์ MinIO (สำหรับตั้ง cron บนเซิร์ฟเวอร์จริง)
├── backend/                 # Node.js + Express + TypeScript + Prisma
│   ├── assets/fonts/        # Sarabun TTF สำหรับฝัง font ภาษาไทยใน PDF report
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts       # 3 มาตรฐาน, 10 ตัวชี้วัด, ผู้ใช้ตัวอย่าง 4 บทบาท
│   └── src/
└── frontend/                # React + Vite + TypeScript + Tailwind CSS
    └── src/
```

- **Front-end**: React + Vite, Tailwind CSS (ธีมแดงเลือดนก + dark mode), react-i18next (TH/EN), TanStack Query, Recharts (กราฟแดชบอร์ด สถานะระบายสีตาม `--status-*` เดียวกับ badge ทุกที่ในระบบ)
- **Back-end**: Node.js + Express (TypeScript) เป็น REST API, Prisma ORM
- **Database**: PostgreSQL 16
- **File storage**: MinIO (S3-compatible) — ใช้งานจริงแล้วสำหรับอัปโหลดหลักฐาน (พร้อม presigned download URL); ลิงก์ Google Drive เป็นทางเลือกแทนไฟล์
- **Auth**: JWT (access + refresh), bcrypt, เปิด/ปิดการใช้งานบัญชีได้ (`isActive`)

## เริ่มต้นใช้งาน (Development)

### สิ่งที่ต้องมี
- Node.js ≥ 20
- Docker + Docker Compose

### ขั้นตอน

1. คัดลอกไฟล์ environment:
   ```bash
   cp .env.example .env
   ```

2. เปิด PostgreSQL และ MinIO:
   ```bash
   docker compose up -d
   ```

3. ติดตั้ง dependencies (ทั้ง workspace):
   ```bash
   npm install
   ```

4. รัน migration และ seed ข้อมูลตั้งต้น:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. รันเซิร์ฟเวอร์ทั้งสองฝั่ง (แยกเทอร์มินัล):
   ```bash
   npm run dev:backend    # http://localhost:4000
   npm run dev:frontend   # http://localhost:5173
   ```

6. เปิดเบราว์เซอร์ที่ `http://localhost:5173` และเข้าสู่ระบบด้วยบัญชีตัวอย่าง (รหัสผ่านเดียวกันทุกบัญชี: `Passw0rd!`)

| บทบาท | อีเมล |
| :---- | :---- |
| ครู / ผู้รับผิดชอบ | teacher@qaems.local |
| งานประกันคุณภาพ | qa@qaems.local |
| ผู้ประเมิน สมศ. | assessor@qaems.local |
| ผู้บริหาร | exec@qaems.local |

### คำสั่งอื่น ๆ ที่มีประโยชน์
```bash
npm run prisma:studio   # เปิด Prisma Studio ดู/แก้ข้อมูลในฐานข้อมูล
```

## Deploy ขึ้น production

ต้องมีไฟล์ `.env` ที่ตั้งค่าจริง (รหัสผ่าน/secret ที่ปลอดภัย ไม่ใช่ค่าตัวอย่าง) ที่ repo root ก่อน:

```bash
docker compose -f docker-compose.prod.yml up -d --build

# ครั้งแรกเท่านั้น — นำเข้าข้อมูลตั้งต้น (3 มาตรฐาน, 10 ตัวชี้วัด, ผู้ใช้ตัวอย่าง)
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
```

- Migration ฐานข้อมูล (`prisma migrate deploy`) รันอัตโนมัติทุกครั้งที่ container `backend` เริ่มทำงาน
- `frontend` (Nginx) เป็นจุดเข้าใช้งานเดียว — ให้บริการไฟล์หน้าเว็บและ proxy `/api/*` ไปยัง `backend` ภายใน network เดียวกัน (ตั้งค่าที่ `nginx/nginx.conf`); พอร์ตที่เปิดออกสู่ภายนอกกำหนดผ่าน `HTTP_PORT` (ค่าเริ่มต้น 80)
- **TLS/โดเมน**: docker-compose.prod.yml ยังไม่รวม TLS — เมื่อมีโดเมนแล้วแนะนำตั้ง reverse proxy เพิ่มอีกชั้น (เช่น Caddy หรือ certbot + Nginx) หน้า container `frontend` หรือปรับ `nginx/nginx.conf` ให้รองรับ HTTPS โดยตรง
- **สำรองข้อมูล**: `./scripts/backup.sh` (pg_dump + ไฟล์ MinIO) ตั้งเป็น cron รายวันได้ตามตัวอย่างในสคริปต์ — ยังไม่ได้ส่งไปเก็บนอกเครื่อง (off-site) เอง ต้องต่อยอดเพิ่ม
- ทดสอบ stack นี้ทั้งชุดบนเครื่อง dev แล้ว (build + migrate + seed + login ผ่าน Nginx proxy) ก่อน commit ทุกครั้ง

## แผนการพัฒนา (Roadmap)

1. **Phase 1 — Foundation** ✅: โครงสร้างระบบ, สคีมา+seed ฐานข้อมูลเต็มรูปแบบ, login + RBAC พื้นฐาน, ธีม/ภาษา/โหมดมืด
2. **Phase 2 — Core evidence workflow** ✅: อัปโหลดไฟล์ (MinIO) / แนบลิงก์ Google Drive, ส่งตรวจ, คิวตรวจสอบของงานประกันคุณภาพ (อนุมัติ/ส่งกลับแก้ไข), มอบหมาย/ยกเลิกมอบหมายผู้รับผิดชอบ, จัดการผู้ใช้ (สร้าง/แก้ไข/เปิด-ปิดใช้งาน), จัดการตัวชี้วัด, แจ้งเตือนในระบบ
3. **Phase 3 — มุมมองผู้ประเมิน/ผู้บริหาร + แดชบอร์ด** ✅: แฟ้มตรวจเยี่ยมแบบอ่านอย่างเดียวสำหรับผู้ประเมิน สมศ. (เฉพาะหลักฐานที่ผ่านการตรวจสอบ), แดชบอร์ดกราฟสถานะรายมาตรฐาน+โดนัทสัดส่วนรวม+ตารางความพร้อมรายตัวชี้วัด สำหรับงานประกันคุณภาพและผู้บริหาร (ผู้บริหารเพิ่มรายการความเสี่ยง)
4. **Phase 4 — รายงาน + เสริมความปลอดภัย + Deploy prep** ✅: ส่งออกรายงาน PDF (ฝัง font Sarabun) / Excel (3 ชีท) เฉพาะงานประกันคุณภาพ, validation เพิ่มเติม, rate limit การเข้าสู่ระบบ, เมนูนำทางบนมือถือ (แก้บั๊กที่ก่อนหน้านี้ใช้งานบนมือถือไม่ได้เลย), Docker/Nginx/docker-compose.prod.yml ทดสอบบนเครื่อง dev ครบวงจร — **การ deploy ขึ้นเซิร์ฟเวอร์จริงยังไม่ได้ทำ** (เป็นขั้นตอนแยกที่ต้องยืนยันก่อนดำเนินการ)

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเข้ารหัสด้วย bcrypt, โทเคนยืนยันตัวตนเป็น JWT, บัญชีที่ถูกปิดใช้งาน (`isActive=false`) ล็อกอินไม่ได้
- ทุก endpoint (ยกเว้น `/api/health` และ `/api/auth/login`) ต้องผ่าน `authMiddleware`
- จำกัดจำนวนคำขอเข้าสู่ระบบ (rate limit) ป้องกันการเดารหัสผ่าน และจำกัดคำขอ API โดยรวม
- ครูเข้าถึง/แก้ไขหลักฐานได้เฉพาะตัวชี้วัดที่ตนได้รับมอบหมาย (ตรวจสอบทุก endpoint ที่เกี่ยวกับหลักฐาน)
- ประเภทไฟล์อัปโหลดถูกจำกัด (PDF/DOCX/XLSX/รูปภาพ/ZIP) ขนาดไม่เกิน 50MB, ดาวน์โหลดผ่าน presigned URL ที่หมดอายุตาม `PRESIGNED_URL_EXPIRES_SECONDS` (ค่าเริ่มต้น 10 นาที)
- มี Audit Log บันทึกการเข้าสู่ระบบ, อัปโหลด/ลบเอกสารแนบ, ส่งตรวจ, อนุมัติ/ส่งกลับแก้ไข, เปิดดูเอกสาร, ส่งออกรายงาน, และการจัดการผู้ใช้/มอบหมายงาน
- ผู้ประเมิน สมศ. เปิดดู/ดาวน์โหลดได้เฉพาะหลักฐานที่มีสถานะ "ผ่านการตรวจสอบ" เท่านั้น (บังคับที่ backend ทุก endpoint ที่เกี่ยวข้อง ไม่ใช่แค่ซ่อนใน UI)
- ส่งออกรายงาน (PDF/Excel) จำกัดเฉพาะบทบาทงานประกันคุณภาพ
