// ข้อมูลตั้งต้น (seed) — 3 มาตรฐาน, 10 ตัวชี้วัด, หลักฐาน/วิธีเก็บ/แหล่งข้อมูล
// อ้างอิงจากภาคผนวกใน BUILD_PROMPT.md — ทุกตัวชี้วัดวิธีตรวจเยี่ยม = Virtual Visit
import { randomBytes } from "node:crypto";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface EvidenceSeed {
  th: string;
  en: string;
}

interface IndicatorSeed {
  code: string;
  nameTh: string;
  nameEn: string;
  ownerDepartment: string;
  evidence: EvidenceSeed[];
  collectionMethods: EvidenceSeed[];
  dataSources: EvidenceSeed[];
}

interface StandardSeed {
  code: string;
  nameTh: string;
  nameEn: string;
  indicators: IndicatorSeed[];
}

const DEFAULT_COLLECTION_METHODS: EvidenceSeed[] = [
  { th: "รวบรวมเอกสาร/รายงานจากหน่วยงานผู้รับผิดชอบ", en: "Document/report collection from the responsible unit" },
  { th: "ตรวจสอบผ่านระบบ Virtual Visit", en: "Verification via Virtual Visit" },
];

const standards: StandardSeed[] = [
  {
    code: "STD1",
    nameTh: "คุณลักษณะของผู้สำเร็จการศึกษาอาชีวศึกษาที่พึงประสงค์",
    nameEn: "Desirable Characteristics of Vocational Education Graduates",
    indicators: [
      {
        code: "1.1",
        nameTh: "ความรู้ของผู้สำเร็จการศึกษาอาชีวศึกษา",
        nameEn: "Knowledge of Vocational Education Graduates",
        ownerDepartment: "งานวัดผลและประเมินผล",
        evidence: [
          { th: "ผลการทดสอบสมรรถนะในหมวดวิชาสมรรถนะแกนกลาง ปี 2568 และย้อนหลัง 2 ปี", en: "Core competency test results for 2025 and the previous 2 years" },
          { th: "รายงานผลการทดสอบ V-Net (สทศ.) ย้อนหลัง 2 ปี", en: "V-Net (NIETS) test result report, previous 2 years" },
          { th: "ผลการทดสอบภาษาต่างประเทศ (THAI-TEP) ปี 2568 และย้อนหลัง 2 ปี", en: "Foreign language test results (THAI-TEP) for 2025 and the previous 2 years" },
          { th: "ข้อมูลแบบอย่างที่ดี/นวัตกรรมด้านการจัดการความรู้", en: "Best practice/innovation data on knowledge management" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "งานวัดผลและประเมินผล", en: "Measurement and Evaluation Section" }],
      },
      {
        code: "1.2",
        nameTh: "ทักษะและการนำไปประยุกต์ใช้ของผู้สำเร็จการศึกษา",
        nameEn: "Skills and Application by Graduates",
        ownerDepartment: "ศูนย์บ่มเพาะผู้ประกอบการ",
        evidence: [
          { th: "รายงานศูนย์บ่มเพาะผู้ประกอบการ แผนธุรกิจ บัญชีรายรับ-รายจ่าย ผลสัมฤทธิ์", en: "Entrepreneurship incubation center report: business plan, income-expense records, results" },
          { th: "การทดสอบมาตรฐานอาชีพ/สำเนาใบประกาศฯ", en: "Occupational standard testing / certificate copies" },
          { th: "โครงการค่ายบ่มเพาะเข้มข้น (Bootcamp) + Action Plan", en: "Intensive incubation bootcamp project + action plan" },
          { th: "พื้นที่ห้องปฏิบัติการระบบนิเวศนวัตกรรม", en: "Innovation ecosystem lab space" },
          { th: "Best Practice/นวัตกรรม", en: "Best practice / innovation" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ศูนย์บ่มเพาะผู้ประกอบการ", en: "Entrepreneurship Incubation Center" }],
      },
      {
        code: "1.3",
        nameTh: "คุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์",
        nameEn: "Morality, Ethics and Desirable Characteristics",
        ownerDepartment: "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา",
        evidence: [
          { th: "รายงานโครงการส่งเสริมคุณธรรมจริยธรรม", en: "Morality and ethics promotion project report" },
          { th: "รายงานผลสัมฤทธิ์การเปลี่ยนแปลงพฤติกรรม", en: "Behavioral change outcome report" },
          { th: "รายงานโครงการจิตสาธารณะ", en: "Public-mindedness project report" },
          { th: "Best Practice/นวัตกรรม", en: "Best practice / innovation" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา", en: "Student Affairs Development Division" }],
      },
      {
        code: "1.4",
        nameTh: "ผลสัมฤทธิ์ของผู้สำเร็จการศึกษา",
        nameEn: "Achievement of Graduates",
        ownerDepartment: "รองผู้อำนวยการฝ่ายวิชาการ",
        evidence: [
          { th: "Dashboard/Excel ติดตามผู้สำเร็จการศึกษา 2565–2567", en: "Graduate tracking dashboard/Excel, 2022–2024" },
          { th: "อัตราสำเร็จการศึกษาตามเวลาแยกสาขา", en: "On-time graduation rate by program" },
          { th: "กลไกดูแลช่วยเหลือผู้เรียน/มีงานทำ/ศึกษาต่อ", en: "Student support mechanisms / employment / further study" },
          { th: "ความพึงพอใจสถานประกอบการ", en: "Employer satisfaction survey" },
          { th: "การนำ Feedback ไปปรับปรุง", en: "Use of feedback for improvement" },
          { th: "Best Practice/นวัตกรรม", en: "Best practice / innovation" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ฝ่ายวิชาการ", en: "Academic Affairs Division" }],
      },
    ],
  },
  {
    code: "STD2",
    nameTh: "การจัดการอาชีวศึกษา",
    nameEn: "Vocational Education Management",
    indicators: [
      {
        code: "2.1",
        nameTh: "หลักสูตรอาชีวศึกษา",
        nameEn: "Vocational Curriculum",
        ownerDepartment: "รองฝ่ายวิชาการ",
        evidence: [
          { th: "แผนการจัดการเรียนรู้", en: "Learning management plans" },
          { th: "การพัฒนาหลักสูตรฐานสมรรถนะ (PDCA)", en: "Competency-based curriculum development (PDCA)" },
          { th: "MOU สถานประกอบการ", en: "MOUs with establishments" },
          { th: "การนำหลักสูตรไปใช้", en: "Curriculum implementation records" },
          { th: "ผลฝึกประสบการณ์ทักษะวิชาชีพ", en: "Professional skills work-experience results" },
          { th: "บันทึกนิเทศ", en: "Supervision records" },
          { th: "โครงการที่สอดคล้อง", en: "Related projects" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ฝ่ายวิชาการ", en: "Academic Affairs Division" }],
      },
      {
        code: "2.2",
        nameTh: "การจัดการเรียนการสอนอาชีวศึกษา",
        nameEn: "Vocational Teaching and Learning Management",
        ownerDepartment: "งานพัฒนาหลักสูตรการเรียนการสอน",
        evidence: [
          { th: "คุณวุฒิครูตรงสาขา", en: "Teacher qualifications matching field" },
          { th: "แผนการสอน/ฝึกอาชีพ", en: "Teaching / vocational training plans" },
          { th: "เทคนิค/เทคโนโลยีการสอน", en: "Teaching techniques / technology" },
          { th: "การบริหารชั้นเรียน/สื่อ", en: "Classroom / media management" },
          { th: "ระบบวัดประเมินผล", en: "Assessment and evaluation system" },
          { th: "ผลประเมินครูโดยผู้เรียน", en: "Teacher evaluation results by learners" },
          { th: "แผนพัฒนาตนเองของครู", en: "Teacher self-development plans" },
          { th: "โครงการใช้เทคโนโลยีดิจิทัล", en: "Digital technology usage projects" },
          { th: "โครงการที่สอดคล้อง", en: "Related projects" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "งานพัฒนาหลักสูตรการเรียนการสอน", en: "Curriculum and Instruction Development Section" }],
      },
      {
        code: "2.3",
        nameTh: "การบริหารจัดการสถานศึกษา",
        nameEn: "School Administration and Management",
        ownerDepartment: "รองฝ่ายบริหารทรัพยากร",
        evidence: [
          { th: "ผลประเมินระบบสารสนเทศ", en: "Information system evaluation results" },
          { th: "แผนพัฒนาอาคารสถานที่/ความปลอดภัย", en: "Facilities / safety development plan" },
          { th: "ระบบสาธารณูปโภค/กล้องวงจรปิด/ดับเพลิง", en: "Utilities / CCTV / fire safety systems" },
          { th: "บันทึกการประชุมการมีส่วนร่วม", en: "Participatory meeting minutes" },
          { th: "ความพึงพอใจผู้รับบริการ", en: "Service recipient satisfaction survey" },
          { th: "การนำผลประกันคุณภาพไปใช้และเผยแพร่", en: "Use and dissemination of QA results" },
          { th: "โครงการที่สอดคล้อง", en: "Related projects" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ฝ่ายบริหารทรัพยากร", en: "Resource Administration Division" }],
      },
      {
        code: "2.4",
        nameTh: "การนำนโยบายสู่การปฏิบัติ",
        nameEn: "Policy Implementation",
        ownerDepartment: "รองฝ่ายแผนงานและความร่วมมือ",
        evidence: [
          { th: "โครงการตามนโยบายต้นสังกัด", en: "Projects per parent-agency policy" },
          { th: "มาตรฐานฝีมือแรงงานแห่งชาติ", en: "National skill standards" },
          { th: "ปฐมนิเทศนักศึกษาฝึกประสบการณ์", en: "Orientation for work-experience students" },
          { th: "แผนงานปีต่อไป", en: "Next-year work plan" },
          { th: "โครงการที่สอดคล้อง", en: "Related projects" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "ฝ่ายแผนงานและความร่วมมือ", en: "Planning and Cooperation Division" }],
      },
    ],
  },
  {
    code: "STD3",
    nameTh: "การสร้างสังคมแห่งการเรียนรู้",
    nameEn: "Building a Learning Society",
    indicators: [
      {
        code: "3.1",
        nameTh: "ความร่วมมือในการสร้างสังคมแห่งการเรียนรู้",
        nameEn: "Collaboration in Building a Learning Society",
        ownerDepartment: "งานความร่วมมือ",
        evidence: [
          { th: "ความร่วมมือกับสถาบัน/สถานประกอบการ/หน่วยงาน", en: "Cooperation with institutions / establishments / agencies" },
          { th: "หลักสูตรอบรม 32 ชม. + ความพึงพอใจ", en: "32-hour training courses + satisfaction results" },
          { th: "รายชื่อครูฝึก/ครูภูมิปัญญา/ผู้เชี่ยวชาญ", en: "List of trainers / local wisdom teachers / experts" },
          { th: "ทุนการศึกษาจากภาคีเครือข่าย", en: "Scholarships from network partners" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "งานความร่วมมือ", en: "Cooperation Section" }],
      },
      {
        code: "3.2",
        nameTh: "นวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์และงานวิจัย",
        nameEn: "Innovation, Inventions, Creative Works and Research",
        ownerDepartment: "งานส่งเสริมวิจัย นวัตกรรมและสิ่งประดิษฐ์",
        evidence: [
          { th: "สรุปงานวิจัยในชั้นเรียนรายแผนก", en: "Summary of classroom action research by department" },
          { th: "วิธีส่งเสริมสิ่งประดิษฐ์คนรุ่นใหม่", en: "Methods for promoting young inventors' works" },
          { th: "สรุปผลงานสิ่งประดิษฐ์และการใช้ประโยชน์", en: "Summary of inventions and their utilization" },
        ],
        collectionMethods: DEFAULT_COLLECTION_METHODS,
        dataSources: [{ th: "งานส่งเสริมวิจัย นวัตกรรมและสิ่งประดิษฐ์", en: "Research, Innovation and Invention Promotion Section" }],
      },
    ],
  },
];

// หมายเหตุ: ไม่มีบัญชีบทบาท assessor อีกต่อไป — ผู้ประเมิน สมศ. เข้าถึงแฟ้มตรวจเยี่ยม/สถิติ
// ผ่านหน้าเว็บสาธารณะ (ไม่ต้องล็อกอิน) แทน ดู backend/src/modules/public/
const demoUsers: { name: string; email: string; role: UserRole; department: string }[] = [
  { name: "ครูสมชาย ใจดี", email: "teacher@qaems.local", role: UserRole.teacher, department: "งานวัดผลและประเมินผล" },
  { name: "งานประกันคุณภาพ วิทยาลัย", email: "qa@qaems.local", role: UserRole.qa, department: "งานประกันคุณภาพ" },
  { name: "ผู้อำนวยการวิทยาลัย", email: "exec@qaems.local", role: UserRole.exec, department: "ผู้บริหาร" },
];

const DEMO_PASSWORD = "Passw0rd!";

// เปิดใช้เฉพาะ dev เท่านั้น (ตั้งใน backend/.env ซึ่งไม่ได้ commit) — ห้ามเปิดบน production
// เพราะรหัสผ่านตัวอย่างนี้ถูกเผยแพร่อยู่ใน README/เอกสารแล้ว
const SEED_DEMO_USERS = process.env.SEED_DEMO_USERS === "true";

function generateBootstrapPassword(): string {
  return randomBytes(9).toString("base64url");
}

async function main() {
  const users: Record<string, { id: string }> = {};

  if (SEED_DEMO_USERS) {
    console.log("Seeding: demo users (SEED_DEMO_USERS=true)...");
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    for (const u of demoUsers) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash },
      });
      users[u.role] = user;
    }
  } else {
    console.log("Seeding: bootstrap qa account (SEED_DEMO_USERS not set — production mode)...");
  }

  console.log("Seeding: standards / indicators / evidence...");
  for (const std of standards) {
    const standard = await prisma.standard.upsert({
      where: { code: std.code },
      update: { nameTh: std.nameTh, nameEn: std.nameEn },
      create: { code: std.code, nameTh: std.nameTh, nameEn: std.nameEn },
    });

    for (const ind of std.indicators) {
      const indicator = await prisma.indicator.upsert({
        where: { code: ind.code },
        update: {
          nameTh: ind.nameTh,
          nameEn: ind.nameEn,
          ownerDepartment: ind.ownerDepartment,
          standardId: standard.id,
        },
        create: {
          code: ind.code,
          nameTh: ind.nameTh,
          nameEn: ind.nameEn,
          ownerDepartment: ind.ownerDepartment,
          visitMethod: "Virtual Visit",
          standardId: standard.id,
        },
      });

      // ล้างหลักฐาน/วิธีเก็บ/แหล่งข้อมูลเดิมก่อน seed ใหม่ (idempotent)
      await prisma.evidenceItem.deleteMany({ where: { indicatorId: indicator.id } });
      await prisma.collectionMethod.deleteMany({ where: { indicatorId: indicator.id } });
      await prisma.dataSource.deleteMany({ where: { indicatorId: indicator.id } });

      await prisma.evidenceItem.createMany({
        data: ind.evidence.map((e, idx) => ({
          indicatorId: indicator.id,
          order: idx + 1,
          descriptionTh: e.th,
          descriptionEn: e.en,
        })),
      });

      await prisma.collectionMethod.createMany({
        data: ind.collectionMethods.map((m) => ({
          indicatorId: indicator.id,
          name: `${m.th} / ${m.en}`,
        })),
      });

      await prisma.dataSource.createMany({
        data: ind.dataSources.map((s) => ({
          indicatorId: indicator.id,
          name: `${s.th} / ${s.en}`,
        })),
      });

      // มอบหมายผู้รับผิดชอบตัวอย่าง: ตัวชี้วัดแรกของแต่ละมาตรฐานมอบให้ครูสาธิต (เฉพาะ dev)
      if (SEED_DEMO_USERS && ind === std.indicators[0]) {
        await prisma.assignment.upsert({
          where: { userId_indicatorId: { userId: users.teacher.id, indicatorId: indicator.id } },
          update: {},
          create: { userId: users.teacher.id, indicatorId: indicator.id },
        });
      }
    }
  }

  console.log("Seed complete.");
  if (SEED_DEMO_USERS) {
    console.log("Demo accounts (password for all: %s):", DEMO_PASSWORD);
    demoUsers.forEach((u) => console.log(`  - ${u.role}: ${u.email}`));
  } else {
    const bootstrapEmail = process.env.BOOTSTRAP_QA_EMAIL ?? "qa@qaems.local";
    const bootstrapPassword = generateBootstrapPassword();
    const passwordHash = await bcrypt.hash(bootstrapPassword, 10);
    await prisma.user.upsert({
      where: { email: bootstrapEmail },
      update: {},
      create: { name: "งานประกันคุณภาพ (Bootstrap)", email: bootstrapEmail, role: UserRole.qa, passwordHash },
    });
    console.log("Bootstrap qa account created — save this password now, it will not be shown again:");
    console.log(`  email:    ${bootstrapEmail}`);
    console.log(`  password: ${bootstrapPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
