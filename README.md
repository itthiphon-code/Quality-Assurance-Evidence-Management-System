# QA-EMS — ระบบรายงานผลการดำเนินงานประกันคุณภาพการศึกษา วิทยาลัยเทคนิคอุบลราชธานี

ระบบจัดเก็บข้อมูลการตรวจเยี่ยมสถานศึกษา (Quality-Assurance Evidence Management System) สำหรับวิทยาลัยเทคนิคอุบลราชธานี รองรับการประกันคุณภาพภายนอกด้านการอาชีวศึกษาโดย สมศ. รอบ พ.ศ. 2567–2571

> สถานะปัจจุบัน: **Deploy ขึ้น production แล้วที่ https://ems.utc.ac.th** พร้อมปรับให้ผู้ประเมิน สมศ./บุคคลทั่วไปเข้าดูแฟ้มตรวจเยี่ยมและสถิติได้จากหน้าแรกโดยไม่ต้องเข้าสู่ระบบ 

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

6. เปิดเบราว์เซอร์ที่ `http://localhost:5173` — หน้าแรกเป็นแฟ้มตรวจเยี่ยมสาธารณะ (ไม่ต้องล็อกอิน) ส่วนผู้รับผิดชอบนำข้อมูลเข้าระบบเข้าสู่ระบบด้วยบัญชีตัวอย่าง (รหัสผ่านเดียวกันทุกบัญชี: `Passw0rd!`)

| บทบาท | อีเมล |
| :---- | :---- |
| ครู / ผู้รับผิดชอบ | teacher@qaems.local |
| งานประกันคุณภาพ | qa@qaems.local |
| ผู้บริหาร | exec@qaems.local |

> ผู้ประเมิน สมศ. และบุคคลทั่วไป**ไม่ต้องมีบัญชี** — เข้าดูสถิติความพร้อมและหลักฐานที่ผ่านการตรวจสอบแล้วได้ทันทีที่หน้าแรก

### คำสั่งอื่น ๆ ที่มีประโยชน์
```bash
npm run prisma:studio   # เปิด Prisma Studio ดู/แก้ข้อมูลในฐานข้อมูล
```

## Deploy ขึ้น production

**สถานะจริง**: รันอยู่ที่ `https://ems.utc.ac.th` (เซิร์ฟเวอร์ `<server-ip>`) หลัง [nginx-proxy-manager](https://nginxproxymanager.com/) ที่ทีมงานตั้งไว้เอง (จัดการ TLS/Let's Encrypt ให้) — `docker-compose.prod.yml` จึงไม่เปิดพอร์ต 80/443 สู่ภายนอกเอง แต่เข้าร่วม Docker network เดียวกับ NPM แทน (ตั้งชื่อ network ผ่าน `frontend.networks` ใน compose file) และเปิดเฉพาะ `127.0.0.1:${HTTP_PORT:-8080}` ไว้ตรวจสอบจากในเครื่องเซิร์ฟเวอร์เอง

ต้องมีไฟล์ `.env` ที่ตั้งค่าจริง (รหัสผ่าน/secret ที่ปลอดภัย ไม่ใช่ค่าตัวอย่าง) ที่ repo root ก่อน:

```bash
docker compose -f docker-compose.prod.yml up -d --build

# ครั้งแรกเท่านั้น — นำเข้าข้อมูลตั้งต้น (3 มาตรฐาน, 10 ตัวชี้วัด) + บัญชี qa ตั้งต้น 1 บัญชี
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
```

- Migration ฐานข้อมูล (`prisma migrate deploy`) รันอัตโนมัติทุกครั้งที่ container `backend` เริ่มทำงาน
- **ไม่ตั้งค่า `SEED_DEMO_USERS=true` บน production** — seed จะสร้างเฉพาะข้อมูลมาตรฐาน/ตัวชี้วัด และบัญชี qa ตั้งต้น 1 บัญชีพร้อมรหัสผ่านสุ่ม (แสดงครั้งเดียวตอน seed รัน)
- ถ้าใช้ reverse proxy อื่นแทน nginx-proxy-manager (เช่น certbot + Nginx เอง หรือ Caddy) ให้ปรับ network/port binding ใน `docker-compose.prod.yml` ตามความเหมาะสม
- **สำรองข้อมูล**: `./scripts/backup.sh` (pg_dump + ไฟล์ MinIO) ตั้งเป็น cron รายวันได้ตามตัวอย่างในสคริปต์ — ยังไม่ได้ส่งไปเก็บนอกเครื่อง (off-site) เอง ต้องต่อยอดเพิ่ม
- ทดสอบ stack นี้ทั้งชุดบนเครื่อง dev แล้ว (build + migrate + seed + login ผ่าน Nginx proxy) ก่อน deploy จริงทุกครั้ง

## แผนการพัฒนา (Roadmap)

1. **Phase 1 — Foundation** ✅: โครงสร้างระบบ, สคีมา+seed ฐานข้อมูลเต็มรูปแบบ, login + RBAC พื้นฐาน, ธีม/ภาษา/โหมดมืด
2. **Phase 2 — Core evidence workflow** ✅: อัปโหลดไฟล์ (MinIO) / แนบลิงก์ Google Drive, ส่งตรวจ, คิวตรวจสอบของงานประกันคุณภาพ (อนุมัติ/ส่งกลับแก้ไข), มอบหมาย/ยกเลิกมอบหมายผู้รับผิดชอบ, จัดการผู้ใช้ (สร้าง/แก้ไข/เปิด-ปิดใช้งาน), จัดการตัวชี้วัด, แจ้งเตือนในระบบ
3. **Phase 3 — แดชบอร์ด** ✅: แดชบอร์ดกราฟสถานะรายมาตรฐาน+โดนัทสัดส่วนรวม+ตารางความพร้อมรายตัวชี้วัด สำหรับงานประกันคุณภาพและผู้บริหาร (ผู้บริหารเพิ่มรายการความเสี่ยง)
4. **Phase 4 — รายงาน + เสริมความปลอดภัย + Deploy** ✅: ส่งออกรายงาน PDF (ฝัง font Sarabun) / Excel (3 ชีท) เฉพาะงานประกันคุณภาพ, validation เพิ่มเติม, rate limit การเข้าสู่ระบบ, เมนูนำทางบนมือถือ, deploy ขึ้น production จริงหลัง nginx-proxy-manager พร้อม HTTPS
5. **หน้าแฟ้มตรวจเยี่ยมสาธารณะ** ✅: ยกเลิกบทบาทผู้ประเมิน สมศ. แบบต้องล็อกอิน — เปลี่ยนเป็นหน้าแรกสาธารณะ (ไม่ต้องเข้าสู่ระบบ) แสดงสถิติความพร้อม + เปิดดูหลักฐานที่ผ่านการตรวจสอบแล้วได้ทันที บัญชีล็อกอินเหลือเฉพาะครู/งานประกันคุณภาพ/ผู้บริหาร (ผู้ที่นำข้อมูลเข้าระบบหรือดูแดชบอร์ดภายใน)

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเข้ารหัสด้วย bcrypt, โทเคนยืนยันตัวตนเป็น JWT, บัญชีที่ถูกปิดใช้งาน (`isActive=false`) ล็อกอินไม่ได้
- ทุก endpoint ที่ไม่ใช่สาธารณะ (ยกเว้น `/api/health`, `/api/auth/login`, `/api/public/*`) ต้องผ่าน `authMiddleware`
- จำกัดจำนวนคำขอเข้าสู่ระบบ (rate limit) ป้องกันการเดารหัสผ่าน และจำกัดคำขอ API โดยรวม (ครอบคลุมเส้นทางสาธารณะด้วย)
- ครูเข้าถึง/แก้ไขหลักฐานได้เฉพาะตัวชี้วัดที่ตนได้รับมอบหมาย (ตรวจสอบทุก endpoint ที่เกี่ยวกับหลักฐาน)
- ประเภทไฟล์อัปโหลดถูกจำกัด (PDF/DOCX/XLSX/รูปภาพ/ZIP) ขนาดไม่เกิน 50MB, ดาวน์โหลดผ่าน presigned URL ที่หมดอายุตาม `PRESIGNED_URL_EXPIRES_SECONDS` (ค่าเริ่มต้น 10 นาที)
- มี Audit Log บันทึกการเข้าสู่ระบบ, อัปโหลด/ลบเอกสารแนบ, ส่งตรวจ, อนุมัติ/ส่งกลับแก้ไข, เปิดดูเอกสาร, ส่งออกรายงาน, และการจัดการผู้ใช้/มอบหมายงาน — รวมถึงการเปิดดูแบบสาธารณะ (บันทึกโดยไม่ระบุตัวตนผู้ใช้)
- **หน้าแฟ้มตรวจเยี่ยมสาธารณะ**: ใครก็ตามที่มี URL เปิดดู/ดาวน์โหลดหลักฐานที่มีสถานะ "ผ่านการตรวจสอบ" เท่านั้นได้โดยไม่ต้องล็อกอิน (บังคับที่ backend ทุก endpoint ที่เกี่ยวข้อง ไม่ใช่แค่ซ่อนใน UI) — เป็นการตัดสินใจของผู้ใช้งานเพื่อเปิดให้ผู้ประเมิน สมศ. เข้าถึงได้สะดวก หลักฐานที่ยังไม่ผ่านการตรวจสอบไม่มีทางเข้าถึงได้จากเส้นทางสาธารณะ
- ส่งออกรายงาน (PDF/Excel) จำกัดเฉพาะบทบาทงานประกันคุณภาพ
