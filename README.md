# QA-EMS — ระบบจัดเก็บหลักฐานประกันคุณภาพ

ระบบจัดเก็บข้อมูลการตรวจเยี่ยมสถานศึกษา (Quality-Assurance Evidence Management System) สำหรับวิทยาลัยเทคนิคอุบลราชธานี รองรับการประกันคุณภาพภายนอกด้านการอาชีวศึกษาโดย สมศ. รอบ พ.ศ. 2567–2571

> สถานะปัจจุบัน: **Phase 3 — มุมมองผู้ประเมิน/ผู้บริหาร + แดชบอร์ด** (แฟ้มตรวจเยี่ยมแบบอ่านอย่างเดียวสำหรับผู้ประเมิน สมศ., แดชบอร์ดกราฟ+ตารางความพร้อมสำหรับงานประกันคุณภาพและผู้บริหาร). ดูรายละเอียดแผนทั้งหมดที่ `BUILD_PROMPT.md`

## สถาปัตยกรรม

```
/
├── docker-compose.yml     # PostgreSQL + MinIO (dev)
├── backend/                # Node.js + Express + TypeScript + Prisma
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts      # 3 มาตรฐาน, 10 ตัวชี้วัด, ผู้ใช้ตัวอย่าง 4 บทบาท
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

## แผนการพัฒนา (Roadmap)

1. **Phase 1 — Foundation** ✅: โครงสร้างระบบ, สคีมา+seed ฐานข้อมูลเต็มรูปแบบ, login + RBAC พื้นฐาน, ธีม/ภาษา/โหมดมืด
2. **Phase 2 — Core evidence workflow** ✅: อัปโหลดไฟล์ (MinIO) / แนบลิงก์ Google Drive, ส่งตรวจ, คิวตรวจสอบของงานประกันคุณภาพ (อนุมัติ/ส่งกลับแก้ไข), มอบหมาย/ยกเลิกมอบหมายผู้รับผิดชอบ, จัดการผู้ใช้ (สร้าง/แก้ไข/เปิด-ปิดใช้งาน), จัดการตัวชี้วัด, แจ้งเตือนในระบบ
3. **Phase 3 — มุมมองผู้ประเมิน/ผู้บริหาร + แดชบอร์ด** ✅: แฟ้มตรวจเยี่ยมแบบอ่านอย่างเดียวสำหรับผู้ประเมิน สมศ. (เฉพาะหลักฐานที่ผ่านการตรวจสอบ), แดชบอร์ดกราฟสถานะรายมาตรฐาน+โดนัทสัดส่วนรวม+ตารางความพร้อมรายตัวชี้วัด สำหรับงานประกันคุณภาพและผู้บริหาร (ผู้บริหารเพิ่มรายการความเสี่ยง)
4. **Phase 4 — รายงาน + เสริมความปลอดภัย + Deploy**: Export PDF/Excel, validation ครบทุก endpoint, Docker+Nginx สำหรับ production

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเข้ารหัสด้วย bcrypt, โทเคนยืนยันตัวตนเป็น JWT, บัญชีที่ถูกปิดใช้งาน (`isActive=false`) ล็อกอินไม่ได้
- ทุก endpoint (ยกเว้น `/api/health` และ `/api/auth/login`) ต้องผ่าน `authMiddleware`
- ครูเข้าถึง/แก้ไขหลักฐานได้เฉพาะตัวชี้วัดที่ตนได้รับมอบหมาย (ตรวจสอบทุก endpoint ที่เกี่ยวกับหลักฐาน)
- ประเภทไฟล์อัปโหลดถูกจำกัด (PDF/DOCX/XLSX/รูปภาพ/ZIP) ขนาดไม่เกิน 50MB, ดาวน์โหลดผ่าน presigned URL ที่หมดอายุใน 5 นาที
- มี Audit Log บันทึกการเข้าสู่ระบบ, อัปโหลด/ลบเอกสารแนบ, ส่งตรวจ, อนุมัติ/ส่งกลับแก้ไข, เปิดดูเอกสาร, และการจัดการผู้ใช้/มอบหมายงาน
- ผู้ประเมิน สมศ. เปิดดู/ดาวน์โหลดได้เฉพาะหลักฐานที่มีสถานะ "ผ่านการตรวจสอบ" เท่านั้น (บังคับที่ backend ทุก endpoint ที่เกี่ยวข้อง ไม่ใช่แค่ซ่อนใน UI)
