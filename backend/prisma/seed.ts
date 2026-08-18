// ข้อมูลตั้งต้น (seed) — 3 มาตรฐาน, 10 ตัวชี้วัด, หลักฐาน/วิธีเก็บ/แหล่งข้อมูล
// อ้างอิงจาก "แผนการเก็บข้อมูลในการตรวจเยี่ยมสถานศึกษาอาชีวศึกษา" ฉบับจริงของ สมศ.
// (การประกันคุณภาพภายนอกด้านการอาชีวศึกษา พ.ศ. 2567–2571) — ทุกตัวชี้วัดวิธีตรวจเยี่ยม = Virtual Visit
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

const DOCUMENT_INTERVIEW_OBSERVE: EvidenceSeed[] = [
  { th: "ศึกษาเอกสารที่ใช้ในการปฏิบัติงานจริงหรือเอกสารที่ได้รับการรับรองความถูกต้องจากสถานศึกษา", en: "Review of documents actually used in practice, or documents certified accurate by the institution" },
  { th: "สัมภาษณ์บุคคลที่เกี่ยวข้อง", en: "Interviews with relevant personnel" },
  { th: "สังเกตบริบทสถานศึกษา", en: "On-site context observation" },
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
          { th: "ผลการทดสอบสมรรถนะในหมวดวิชาสมรรถนะแกนกลาง ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Core competency subject test results for academic year 2025 and the previous 2 academic years" },
          { th: "รายงานผลการทดสอบ V-Net ของสถาบันทดสอบทางการศึกษาแห่งชาติ (องค์การมหาชน) ย้อนหลัง 2 ปีการศึกษา", en: "V-Net test result report from the National Institute of Educational Testing Service (Public Organization), previous 2 academic years" },
          { th: "ผลการทดสอบภาษาต่างประเทศ (THAI-TEP) ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Foreign language test results (THAI-TEP) for academic year 2025 and the previous 2 academic years" },
          { th: "ข้อมูลแบบอย่างที่ดี (Best Practice) หรือนวัตกรรม (Innovation) ในการจัดการความรู้ของผู้สำเร็จการศึกษาจนเป็นต้นแบบให้สถานศึกษาอื่นได้นำไปใช้", en: "Best practice / innovation data on graduate knowledge management that has become a model adopted by other institutions" },
        ],
        collectionMethods: [
          { th: "ศึกษาเอกสาร", en: "Document review" },
          { th: "สัมภาษณ์", en: "Interview" },
          { th: "การแชร์หน้าจอ (Screen Share)", en: "Screen sharing" },
          { th: "ไฟล์ข้อมูลตารางสถิติ", en: "Statistical data files" },
        ],
        dataSources: [
          { th: "งานวัดผลและประเมินผล", en: "Measurement and Evaluation Section" },
          { th: "งานพัฒนาหลักสูตร", en: "Curriculum Development Section" },
          { th: "งานครูที่ปรึกษา", en: "Homeroom Teacher Section" },
          { th: "ครูผู้สอนหมวดสมรรถนะแกนกลาง", en: "Core Competency Subject Teachers" },
        ],
      },
      {
        code: "1.2",
        nameTh: "ทักษะและการนำไปประยุกต์ใช้ของผู้สำเร็จการศึกษา",
        nameEn: "Skills and Application by Graduates",
        ownerDepartment: "ศูนย์บ่มเพาะผู้ประกอบการ",
        evidence: [
          { th: "รายงานการดำเนินงานศูนย์บ่มเพาะผู้ประกอบการอาชีวศึกษา แผนธุรกิจ บัญชีรายรับ-รายจ่าย และการประเมินผลสัมฤทธิ์ของผู้สำเร็จการศึกษาที่เข้าร่วมโครงการ ปีการศึกษา 2568 และย้อนหลัง 2 ปี", en: "Vocational entrepreneurship incubation center operations report — business plans, income-expense records, and outcome evaluation of participating graduates, academic year 2025 and the previous 2 years" },
          { th: "ข้อมูลการทดสอบมาตรฐานอาชีพของหน่วยงานภายนอก สำเนาใบประกาศนียบัตรของผู้สำเร็จการศึกษาที่ผ่านการประเมินจากหน่วยงานภายนอก ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "External occupational standard testing data and certificate copies of graduates assessed by external agencies, academic year 2025 and the previous 2 academic years" },
          { th: "รายงานผลการดำเนินโครงการค่ายบ่มเพาะเข้มข้น (Bootcamp) เอกสารสรุปโครงการและแผนการขยายผล (Action Plan) ในการนำรูปแบบนวัตกรรมที่ได้รางวัลระดับชาติ ปีการศึกษา 2568", en: "Intensive incubation bootcamp report — project summary and action plan for scaling up nationally awarded innovation formats, academic year 2025" },
          { th: "พื้นที่ห้องปฏิบัติการที่ใช้สนับสนุนระบบนิเวศนวัตกรรม ของสถานศึกษา ปีการศึกษา 2568", en: "Laboratory space supporting the institution's innovation ecosystem, academic year 2025" },
          { th: "ข้อมูลแบบอย่างที่ดี (Best Practice) หรือ นวัตกรรม (Innovation) ในการจัดการให้ผู้สำเร็จการศึกษามีทักษะและการนำไปประยุกต์ใช้ จนเป็นต้นแบบให้สถานศึกษาอื่นได้นำไปใช้", en: "Best practice / innovation data on developing graduates' skills and application, adopted as a model by other institutions" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "ผู้รับผิดชอบศูนย์บ่มเพาะ", en: "Incubation Center Coordinator" },
          { th: "ตัวแทนผู้ประกอบการฯ", en: "Entrepreneur Representatives" },
          { th: "ศูนย์ทดสอบมาตรฐานอาชีพ", en: "Occupational Standard Testing Center" },
          { th: "ครูที่เกี่ยวข้อง", en: "Relevant Teachers" },
          { th: "งานวิจัยและพัฒนานวัตกรรม", en: "Research and Innovation Development Section" },
          { th: "ห้องปฏิบัติการวิชาชีพ", en: "Professional Laboratory" },
        ],
      },
      {
        code: "1.3",
        nameTh: "คุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์",
        nameEn: "Morality, Ethics and Desirable Characteristics",
        ownerDepartment: "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา",
        evidence: [
          { th: "รายงานสรุปผลการดำเนินโครงการ/กิจกรรมที่ส่งเสริมด้านคุณธรรม จริยธรรม ฉบับสมบูรณ์ ที่ระบุจำนวนผู้เข้าร่วมชัดเจน และผลประเมินความพึงพอใจ ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Complete summary report of morality/ethics promotion projects and activities, with clear participant counts and satisfaction evaluation results, academic year 2025 and the previous 2 academic years" },
          { th: "รายงานผลสัมฤทธิ์ที่แสดงให้เห็นถึงประโยชน์หรือการเปลี่ยนแปลงพฤติกรรมของผู้สำเร็จการศึกษาหลังเข้าร่วมโครงการ/กิจกรรมที่ส่งเสริมด้านคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์ของผู้สำเร็จการศึกษา ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Outcome report showing benefits or behavioral change in graduates after participating in morality/ethics/desirable-characteristics projects, academic year 2025 and the previous 2 academic years" },
          { th: "รายงานผลโครงการด้านจิตสาธารณะ ฉบับสมบูรณ์ที่ระบุจำนวน ชื่อโครงการ ผู้เข้าร่วมที่ชัดเจน และผลประเมินความพึงพอใจ ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Complete public-mindedness project report specifying project names, participant counts, and satisfaction evaluation results, academic year 2025 and the previous 2 academic years" },
          { th: "ข้อมูลแบบอย่างที่ดี (Best Practice) หรือ นวัตกรรม (Innovation) ในการจัดการให้ผู้สำเร็จการศึกษามีคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์จนเป็นต้นแบบให้สถานศึกษาอื่นได้นำไปใช้", en: "Best practice / innovation data on cultivating graduates' morality, ethics, and desirable characteristics, adopted as a model by other institutions" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "ฝ่ายพัฒนากิจการนักเรียนนักศึกษา", en: "Student Affairs Development Division" },
          { th: "งานกิจกรรมนักเรียนนักศึกษา", en: "Student Activities Section" },
          { th: "ตัวแทนผู้เรียน/ศิษย์เก่า", en: "Student/Alumni Representatives" },
          { th: "ครูที่ปรึกษา", en: "Homeroom Teachers" },
        ],
      },
      {
        code: "1.4",
        nameTh: "ผลสัมฤทธิ์ของผู้สำเร็จการศึกษา",
        nameEn: "Achievement of Graduates",
        ownerDepartment: "รองผู้อำนวยการฝ่ายวิชาการ",
        evidence: [
          { th: "ข้อมูลสารสนเทศ (Dashboard/Excel) ฉบับสมบูรณ์ ผลการติดตามผลผู้สำเร็จการศึกษา ปีการศึกษา 2565 ถึงปีการศึกษา 2567", en: "Complete information system (Dashboard/Excel) tracking graduate outcomes, academic years 2022–2024" },
          { th: "รายงานผลอัตราสำเร็จการศึกษาตามเวลา แบบแยกประเภท/สาขาวิชา ปีการศึกษา 2565 ถึงปีการศึกษา 2567", en: "On-time graduation rate report, broken down by program type/field, academic years 2022–2024" },
          { th: "รายงานผลการจัดกิจกรรมและกลไกการดูแลช่วยเหลือผู้เรียน ที่ส่งเสริมให้ผู้สำเร็จการศึกษาตามระยะเวลาที่หลักสูตรกำหนด การมีงานทำหรือประกอบอาชีพอิสระหรือศึกษาต่อ ตามประเภทวิชา สาขาวิชา สาขางานที่สำเร็จการศึกษา ปีการศึกษา 2566 ถึงปีการศึกษา 2568", en: "Report on student-support activities and mechanisms that promote on-time graduation, employment, self-employment, or further study, by program/field/specialization, academic years 2023–2025" },
          { th: "แบบสำรวจความพึงพอใจของสถานประกอบการ ปีการศึกษา 2566 ถึงปีการศึกษา 2568 และข้อเสนอแนะเชิงคุณภาพเพิ่มเติมทุกระดับชั้น และประเภทสาขาวิชา โดยสถานประกอบการ", en: "Employer satisfaction survey, academic years 2023–2025, plus qualitative feedback across all levels and program types from employers" },
          { th: "การนำข้อเสนอแนะ (Feedback) ของสถานประกอบการไปปรับปรุงหรือพัฒนาสถานศึกษา ด้านผลสัมฤทธิ์ของผู้สำเร็จการศึกษา เช่น รายงานการประชุมปรับปรุงหลักสูตร หรือการปรับแนวทางการสอน ปีการศึกษา 2566 ถึงปีการศึกษา 2568", en: "Use of employer feedback to improve the institution's graduate outcomes — e.g. curriculum-revision meeting minutes or teaching-approach adjustments, academic years 2023–2025" },
          { th: "ข้อมูลแบบอย่างที่ดี (Best Practice) หรือ นวัตกรรม (Innovation) ในการจัดการผลสัมฤทธิ์ของผู้สำเร็จการศึกษาจนเป็นต้นแบบให้สถานศึกษาอื่นได้นำไปใช้ปีการศึกษา 2565 ถึงปีการศึกษา 2567", en: "Best practice / innovation data on managing graduate outcomes, adopted as a model by other institutions, academic years 2022–2024" },
        ],
        collectionMethods: [
          { th: "ศึกษาเอกสาร", en: "Document review" },
          { th: "ตรวจสอบระบบสารสนเทศ (IT) และฐานข้อมูล", en: "IT system and database inspection" },
          { th: "การนำข้อมูลออกและเปรียบเทียบ 2 ปี", en: "Data extraction and 2-year comparison" },
          { th: "สัมภาษณ์กลยุทธ์การรักษาผู้เรียนจนจบการศึกษาตามเป้าหมาย", en: "Interview on student-retention strategy toward completion targets" },
          { th: "สุ่มตรวจแบบประเมินตัวจริง (Hard Copy / Google Form)", en: "Random spot-check of original evaluation forms (hard copy / Google Form)" },
          { th: "รายงานการประชุมร่วมกับสถานประกอบการที่นำไปสู่การปรับปรุงงาน (A-Act)", en: "Minutes of meetings with employers leading to work improvement (A-Act)" },
        ],
        dataSources: [
          { th: "รองผู้อำนวยการฝ่ายวิชาการ", en: "Deputy Director for Academic Affairs" },
          { th: "หัวหน้าแผนกวิชา (กลุ่มสาขาอุตสาหกรรม/พาณิชยกรรม)", en: "Department Heads (Industrial/Commercial fields)" },
          { th: "ครูที่ปรึกษา ผู้ทำหน้าที่ติดตามผู้สำเร็จการศึกษา", en: "Homeroom teachers responsible for graduate follow-up" },
          { th: "งานความร่วมมือ", en: "Cooperation Section" },
          { th: "งานทวิภาคี", en: "Dual Vocational Education Section" },
          { th: "งานพัฒนาหลักสูตรการเรียนการสอน", en: "Curriculum and Instruction Development Section" },
          { th: "งานแนะแนวอาชีพและจัดหางาน", en: "Career Guidance and Job Placement Section" },
          { th: "ศูนย์ข้อมูลสารสนเทศ", en: "Information Center" },
        ],
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
          { th: "แผนการจัดการเรียนรู้ที่สอดคล้องกับหลักสูตรที่กำหนด สู่การปฏิบัติที่เน้นผู้เรียนเป็นสำคัญและนำไปใช้ในการจัดการเรียนการสอน", en: "Learning management plans aligned with the prescribed curriculum, student-centered, and actually used in instruction" },
          { th: "เอกสารเกี่ยวกับการส่งเสริมให้ครูผู้สอนพัฒนาหลักสูตรฐานสมรรถนะหรือปรับปรุงรายวิชา หรือปรับปรุงรายวิชาเดิม หรือกำหนดรายวิชาเพิ่มเติมของแต่ละสาขาวิชา สอดคล้องกับอาชีพ ความต้องการของผู้เรียน สังคม สถานประกอบการ ทันต่อการเปลี่ยนแปลงของเทคโนโลยีและความต้องการของตลาดแรงงาน โดยความร่วมมือกับสถานประกอบการหรือหน่วยงานที่เกี่ยวข้อง หรือกิจกรรมในลักษณะของ PDCA", en: "Documentation of teachers developing competency-based curricula, revising existing courses, or adding new courses per field — aligned with careers, learner/community/employer needs, and technology/labor-market change, done in cooperation with employers or in PDCA-style activities" },
          { th: "หลักฐานการทำความร่วมมือ (MOU) กับสถานประกอบการ และผลการสำรวจความต้องการของสถานประกอบการที่นำมาพัฒนาหลักสูตร หรือรายวิชาให้สอดคล้องกับความต้องการ", en: "Evidence of MOUs with employers and employer-needs survey results used to develop the curriculum/courses accordingly" },
          { th: "เอกสารการนำหลักสูตรที่ได้รับการพัฒนาไปใช้", en: "Documentation of the developed curriculum's implementation" },
          { th: "ผลการประเมินการฝึกประสบการณ์ทักษะวิชาชีพหรือฝึกอาชีพร่วมกับสถานประกอบการ", en: "Evaluation results of professional skills / vocational training with employers" },
          { th: "บันทึกการนิเทศ ติดตาม และประเมินผลการฝึกประสบการณ์ทักษะวิชาชีพหรือฝึกอาชีพร่วมกับสถานประกอบการ", en: "Supervision, follow-up, and evaluation records for professional skills / vocational training with employers" },
          { th: "โครงการที่สอดคล้องกับตัวชี้วัดที่ 2.1 เพิ่มเติม", en: "Additional projects related to indicator 2.1" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "รองฝ่ายวิชาการ", en: "Deputy for Academic Affairs" },
          { th: "หัวหน้าแผนกวิชา", en: "Department Heads" },
          { th: "งานอาชีวศึกษาระบบทวิภาคี", en: "Dual Vocational Education Section" },
          { th: "ตัวแทนครูผู้สอน ผู้เรียน", en: "Teacher and Student Representatives" },
        ],
      },
      {
        code: "2.2",
        nameTh: "การจัดการเรียนการสอนอาชีวศึกษา",
        nameEn: "Vocational Teaching and Learning Management",
        ownerDepartment: "งานพัฒนาหลักสูตรการเรียนการสอน",
        evidence: [
          { th: "จำนวนและร้อยละของครูที่มีคุณวุฒิการศึกษาตรงตามสาขาวิชาและจำนวนตามเกณฑ์ที่กำหนดโดยมีความสอดคล้องกับตารางสอน", en: "Number and percentage of teachers with qualifications matching their field, meeting the required quota and consistent with the teaching schedule" },
          { th: "แผนการจัดการเรียนรู้/แผนการฝึกอาชีพ ที่สอดคล้องกับหลักสูตรสู่การปฏิบัติที่เน้นผู้เรียนเป็นสำคัญและนำไปใช้ในการจัดการเรียนการสอน", en: "Learning/vocational-training plans aligned with the curriculum, student-centered, and actually used in instruction" },
          { th: "รูปแบบการจัดการเรียนรู้เทคนิคและเทคโนโลยีที่ใช้ในการจัดเรียนการสอนของครูผู้สอน", en: "Teaching methods, techniques, and technology used by instructors" },
          { th: "การบริหารจัดการชั้นเรียนที่เหมาะสม สื่อการสอนและวัสดุ อุปกรณ์ เครื่องมือ ครุภัณฑ์ที่จำเป็นและสอดคล้องกับการทำงานในสถานประกอบการ", en: "Appropriate classroom management, teaching media, and equipment/tools consistent with actual workplace practice" },
          { th: "ระบบการวัดและประเมินผลการเรียนรู้ ที่หลากหลาย และมีการนำผลประเมินการเรียนรู้มาปรับปรุงและพัฒนาหลักสูตรอย่างต่อเนื่อง เพื่อยกระดับคุณภาพการศึกษา", en: "Diverse learning assessment systems, with results used to continuously improve the curriculum and raise education quality" },
          { th: "ผลการประเมินครูผู้สอนโดยผู้เรียน และแบบประเมินครู", en: "Teacher evaluation results by students, and teacher evaluation forms" },
          { th: "แผนและหลักฐานการพัฒนาตนเองของครูในด้านคุณธรรม จริยธรรม และด้านวิชาการและวิชาชีพ", en: "Teacher self-development plans and evidence, covering morality/ethics and academic/professional development" },
          { th: "โครงการต่าง ๆ ที่ส่งเสริมให้ครูใช้เทคโนโลยีดิจิทัลเพื่อการจัดการเรียนการสอน", en: "Projects promoting teachers' use of digital technology in instruction" },
          { th: "โครงการที่สอดคล้องกับตัวชี้วัดที่ 2.2 เพิ่มเติม", en: "Additional projects related to indicator 2.2" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "รองฝ่ายวิชาการ", en: "Deputy for Academic Affairs" },
          { th: "หัวหน้าแผนกวิชา", en: "Department Heads" },
          { th: "งานพัฒนาหลักสูตรการเรียนการสอน", en: "Curriculum and Instruction Development Section" },
          { th: "ตัวแทนครูผู้สอน ผู้เรียน", en: "Teacher and Student Representatives" },
        ],
      },
      {
        code: "2.3",
        nameTh: "การบริหารจัดการสถานศึกษา",
        nameEn: "School Administration and Management",
        ownerDepartment: "รองฝ่ายบริหารทรัพยากร",
        evidence: [
          { th: "เอกสารข้อมูลรายงานสรุปผลการประเมินระบบสารสนเทศ", en: "Information system evaluation summary report" },
          { th: "แผนพัฒนาและการจัดการสภาพแวดล้อมด้านอาคารสถานที่ ห้องเรียน ห้องปฏิบัติการ โรงฝึกงาน ให้มีความปลอดภัยและถูกสุขลักษณะ", en: "Development plan and environmental management for buildings, classrooms, labs, and workshops to ensure safety and hygiene" },
          { th: "ข้อมูลระบบสาธารณูปโภคพื้นฐาน ระบบรักษาความปลอดภัย ระบบสารสนเทศเพื่อการบริหารจัดการ ระบบอินเทอร์เน็ต ระบบความปลอดภัย ระบบกล้องวงจรปิด และอุปกรณ์ดับเพลิง", en: "Data on basic utilities, security systems, management information systems, internet, safety systems, CCTV, and fire-fighting equipment" },
          { th: "บันทึกการประชุมที่แสดงให้เห็นถึงการมีส่วนร่วมในการบริหารจัดการสถานศึกษาของบุคลากรและผู้มีส่วนได้เสีย", en: "Meeting minutes demonstrating staff and stakeholder participation in institutional management" },
          { th: "เอกสารข้อมูลผลการประเมินความพึงพอใจของผู้รับบริการ", en: "Service-recipient satisfaction evaluation results" },
          { th: "แผนงานและการดำเนินงานที่แสดงให้เห็นว่าสถานศึกษามีการนำผลการประกันคุณภาพภายนอกไปใช้ และมีการเผยแพร่ต่อสาธารณชนผ่านช่องทางที่หลากหลาย", en: "Plans and operations showing the institution's use of external QA results and public dissemination through multiple channels" },
          { th: "โครงการที่สอดคล้องกับตัวชี้วัดที่ 2.3 เพิ่มเติม", en: "Additional projects related to indicator 2.3" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "รองฝ่ายบริหารทรัพยากร", en: "Deputy for Resource Administration" },
          { th: "รองฝ่ายแผนงานและความร่วมมือ", en: "Deputy for Planning and Cooperation" },
          { th: "หัวหน้าแผนกวิชา", en: "Department Heads" },
          { th: "งานอาคารสถานที่", en: "Facilities Section" },
          { th: "งานศูนย์ข้อมูล", en: "Data Center Section" },
          { th: "งานบุคลากร", en: "Personnel Section" },
          { th: "ตัวแทนครูผู้สอน ผู้เรียน", en: "Teacher and Student Representatives" },
        ],
      },
      {
        code: "2.4",
        nameTh: "การนำนโยบายสู่การปฏิบัติ",
        nameEn: "Policy Implementation",
        ownerDepartment: "รองฝ่ายแผนงานและความร่วมมือ",
        evidence: [
          { th: "เอกสาร ข้อมูลรายงานเกี่ยวกับโครงการ/กิจกรรม/งานที่สถานศึกษาดำเนินการตามนโยบายของหน่วยงานต้นสังกัดสู่การปฏิบัติ", en: "Documentation/reports on projects, activities, and work carried out per parent-agency policy" },
          { th: "ข้อมูลการทดสอบมาตรฐานฝีมือแรงงานแห่งชาติหรือมาตรฐานอื่น ๆ", en: "National skill standard testing data or other standards" },
          { th: "โครงการปฐมนิเทศนักเรียน นักศึกษาฝึกประสบการณ์วิชาชีพ", en: "Orientation project for students undergoing professional work experience" },
          { th: "แผนงานที่สถานศึกษาจะดำเนินการตามนโยบายของหน่วยงานต้นสังกัดเพิ่มขึ้นในปีการศึกษาต่อไป", en: "Work plan for additional policy implementation in the next academic year" },
          { th: "โครงการที่สอดคล้องกับตัวชี้วัดที่ 2.4 เพิ่มเติม", en: "Additional projects related to indicator 2.4" },
        ],
        collectionMethods: DOCUMENT_INTERVIEW_OBSERVE,
        dataSources: [
          { th: "รองฝ่ายวิชาการ", en: "Deputy for Academic Affairs" },
          { th: "รองฝ่ายแผนงานและความร่วมมือ", en: "Deputy for Planning and Cooperation" },
          { th: "หัวหน้าแผนกวิชา", en: "Department Heads" },
          { th: "งานอาชีวศึกษาระบบทวิภาคี", en: "Dual Vocational Education Section" },
          { th: "งานพัฒนาหลักสูตรการเรียนการสอน", en: "Curriculum and Instruction Development Section" },
          { th: "งานส่งเสริมผลิตผล การค้า และการประกอบธุรกิจ", en: "Production, Trade and Business Promotion Section" },
          { th: "งานบุคลากร", en: "Personnel Section" },
          { th: "งานกิจกรรมนักเรียนนักศึกษา", en: "Student Activities Section" },
          { th: "ตัวแทนครูผู้สอน ผู้เรียน", en: "Teacher and Student Representatives" },
        ],
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
          { th: "เอกสารหลักฐานความร่วมมือของสถานศึกษากับสถาบันการศึกษาอื่น หรือสถานประกอบการ หรือหน่วยงานภาครัฐ หรือเอกชนในการพัฒนาทักษะทางวิชาชีพให้กับผู้เรียน ปีการศึกษา 2568 และย้อนหลัง 2 ปีการศึกษา", en: "Evidence of the institution's cooperation with other educational institutions, employers, or public/private agencies to develop learners' professional skills, academic year 2025 and the previous 2 academic years" },
          { th: "รายละเอียดหลักสูตรการอบรม 32 ชั่วโมงและรายงานสรุปความพึงพอใจผู้เข้าอบรม", en: "Details of the 32-hour training curriculum and a summary report of trainee satisfaction" },
          { th: "รายชื่อและข้อมูลครูฝึกในสถานประกอบการ ครูภูมิปัญญาท้องถิ่น และครูผู้เชี่ยวชาญ", en: "List and details of workplace trainers, local wisdom teachers, and expert instructors" },
          { th: "รายละเอียดประเภททุนการศึกษาจากภาคีเครือข่าย", en: "Details of scholarship types from network partners" },
        ],
        collectionMethods: [
          { th: "ศึกษาเอกสารที่ใช้ในการปฏิบัติงาน", en: "Review of documents used in practice" },
          { th: "สัมภาษณ์บุคคลที่เกี่ยวข้อง", en: "Interviews with relevant personnel" },
          { th: "สังเกตบริบทสถานศึกษา", en: "On-site context observation" },
        ],
        dataSources: [
          { th: "งานความร่วมมือ", en: "Cooperation Section" },
          { th: "หัวหน้าศูนย์ซ่อมสร้างเพื่อชุมชนแบบถาวร", en: "Head of the Permanent Fix-It Center for the Community" },
          { th: "งานโครงการพิเศษและบริการชุมชน", en: "Special Projects and Community Service Section" },
          { th: "ผู้แทนสถานประกอบการ", en: "Employer Representatives" },
          { th: "ตัวแทนผู้เข้าอบรม", en: "Trainee Representatives" },
        ],
      },
      {
        code: "3.2",
        nameTh: "นวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์และงานวิจัย",
        nameEn: "Innovation, Inventions, Creative Works and Research",
        ownerDepartment: "งานส่งเสริมวิจัย นวัตกรรมและสิ่งประดิษฐ์",
        evidence: [
          { th: "สรุปจำนวนรายงานวิจัยในชั้นเรียนของครูผู้สอนแต่ละแผนกวิชา ทั้งเชิงปริมาณและคุณภาพ", en: "Summary of classroom action research reports by department, both quantitative and qualitative" },
          { th: "ข้อมูลวิธีดำเนินการในการส่งเสริมสนับสนุน ให้ครูและผู้เรียน จัดทำสิ่งประดิษฐ์ของคนรุ่นใหม่", en: "Data on methods used to support teachers and students in creating young-inventor works" },
          { th: "รายงานสรุปจำนวนผลงานสิ่งประดิษฐ์ของคนรุ่นใหม่ และการใช้ประโยชน์ของผลงานทั้งภายในและภายนอกสถานศึกษา ของครูและผู้เรียน ปีการศึกษา 2568", en: "Summary report of young-inventor works and their use within and outside the institution, by teachers and students, academic year 2025" },
        ],
        collectionMethods: [
          { th: "ศึกษาเอกสารที่ใช้ในการปฏิบัติงาน", en: "Review of documents used in practice" },
          { th: "สัมภาษณ์บุคคลที่เกี่ยวข้อง", en: "Interviews with relevant personnel" },
          { th: "สังเกตบริบทสถานศึกษา", en: "On-site context observation" },
        ],
        dataSources: [
          { th: "งานส่งเสริมวิจัย นวัตกรรม และสิ่งประดิษฐ์", en: "Research, Innovation and Invention Promotion Section" },
          { th: "ครูผู้เรียน เจ้าของผลงาน", en: "Teacher/student work owners" },
          { th: "ชิ้นงาน งานวิจัยของครูและผู้เรียน", en: "Teacher/student research works and pieces" },
          { th: "ระบบสารสนเทศในการจัดเก็บผลงาน", en: "Information system for storing works" },
        ],
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

      // วิธีเก็บข้อมูล/แหล่งข้อมูล: ไม่มีตารางอื่นอ้างอิงด้วย FK จึงลบแล้วสร้างใหม่ได้อย่างปลอดภัย (idempotent)
      await prisma.collectionMethod.deleteMany({ where: { indicatorId: indicator.id } });
      await prisma.dataSource.deleteMany({ where: { indicatorId: indicator.id } });

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

      // รายการหลักฐาน: อัปเดตข้อความของรายการเดิมตามตำแหน่ง (order) แทนการลบทิ้งทั้งหมดแล้วสร้างใหม่
      // เพื่อไม่ให้ Attachment/ReviewLog ของหลักฐานที่มีการอัปโหลดจริงแล้วหายไปโดยไม่ตั้งใจเวลารัน seed ซ้ำ
      const existingEvidence = await prisma.evidenceItem.findMany({ where: { indicatorId: indicator.id } });
      const existingByOrder = new Map(existingEvidence.map((e) => [e.order, e]));

      for (let i = 0; i < ind.evidence.length; i++) {
        const order = i + 1;
        const e = ind.evidence[i];
        const existing = existingByOrder.get(order);
        if (existing) {
          await prisma.evidenceItem.update({
            where: { id: existing.id },
            data: { descriptionTh: e.th, descriptionEn: e.en },
          });
        } else {
          await prisma.evidenceItem.create({
            data: { indicatorId: indicator.id, order, descriptionTh: e.th, descriptionEn: e.en },
          });
        }
      }

      // รายการเกินจากจำนวนใหม่ (เช่นตัดหลักฐานออกจากแผน) ลบได้เฉพาะที่ยังไม่มีเอกสารแนบจริง
      const extraEvidence = existingEvidence.filter((e) => e.order > ind.evidence.length);
      for (const extra of extraEvidence) {
        const attachmentCount = await prisma.attachment.count({ where: { evidenceId: extra.id } });
        if (attachmentCount === 0) {
          await prisma.evidenceItem.delete({ where: { id: extra.id } });
        } else {
          console.warn(`  ! ข้ามการลบ evidence order=${extra.order} ของ ${ind.code} เพราะมีเอกสารแนบอยู่แล้ว`);
        }
      }

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
    const existingBootstrap = await prisma.user.findUnique({ where: { email: bootstrapEmail } });
    if (existingBootstrap) {
      console.log(`Bootstrap qa account already exists (${bootstrapEmail}) — password unchanged.`);
    } else {
      const bootstrapPassword = generateBootstrapPassword();
      const passwordHash = await bcrypt.hash(bootstrapPassword, 10);
      await prisma.user.create({
        data: { name: "งานประกันคุณภาพ (Bootstrap)", email: bootstrapEmail, role: UserRole.qa, passwordHash },
      });
      console.log("Bootstrap qa account created — save this password now, it will not be shown again:");
      console.log(`  email:    ${bootstrapEmail}`);
      console.log(`  password: ${bootstrapPassword}`);
    }
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
