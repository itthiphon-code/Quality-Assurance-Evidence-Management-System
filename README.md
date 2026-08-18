# QA-EMS — ระบบจัดเก็บหลักฐานประกันคุณภาพ

ระบบจัดเก็บข้อมูลการตรวจเยี่ยมสถานศึกษา (Quality-Assurance Evidence Management System) สำหรับวิทยาลัยเทคนิคอุบลราชธานี รองรับการประกันคุณภาพภายนอกด้านการอาชีวศึกษาโดย สมศ. รอบ พ.ศ. 2567–2571

> สถานะปัจจุบัน: **Phase 1 — Foundation** (โครงสร้างระบบ, ฐานข้อมูล+seed, auth/RBAC พื้นฐาน, ธีมแดงเลือดนก, สลับ TH/EN, สลับ Dark/Light). ดูรายละเอียดแผนทั้งหมดที่ `BUILD_PROMPT.md`

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

- **Front-end**: React + Vite, Tailwind CSS (ธีมแดงเลือดนก + dark mode), react-i18next (TH/EN), TanStack Query, Recharts (เฟสถัดไป)
- **Back-end**: Node.js + Express (TypeScript) เป็น REST API, Prisma ORM
- **Database**: PostgreSQL 16
- **File storage**: MinIO (S3-compatible) — จะเริ่มใช้งานจริงใน Phase 2 (อัปโหลดหลักฐาน)
- **Auth**: JWT (access + refresh), bcrypt

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
2. **Phase 2 — Core evidence workflow**: อัปโหลดไฟล์/ลิงก์ Google Drive, ส่งตรวจ, คิวตรวจสอบของงานประกันคุณภาพ, การมอบหมายงาน, หน้าจัดการมาตรฐาน/ตัวชี้วัด/ผู้ใช้
3. **Phase 3 — มุมมองผู้ประเมิน/ผู้บริหาร + แดชบอร์ด**: แฟ้มตรวจเยี่ยมแบบอ่านอย่างเดียว, แดชบอร์ดความคืบหน้า/ความพร้อม
4. **Phase 4 — รายงาน + เสริมความปลอดภัย + Deploy**: Export PDF/Excel, validation ครบทุก endpoint, Docker+Nginx สำหรับ production

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเข้ารหัสด้วย bcrypt, โทเคนยืนยันตัวตนเป็น JWT
- ทุก endpoint (ยกเว้น `/api/health` และ `/api/auth/login`) ต้องผ่าน `authMiddleware`
- มี Audit Log บันทึกการเข้าสู่ระบบ (ขยายเพิ่มในเฟสถัดไปสำหรับการอัปโหลด/อนุมัติ/เปิดดู)
