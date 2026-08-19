import { GraduationCap, School, Users, type LucideIcon } from "lucide-react";

// สีและสัญลักษณ์ประจำมาตรฐาน — ใช้แยกกลุ่มมาตรฐานด้วยสายตาในมุมมองที่เป็นการ์ด/แท็บ/กราฟ
// โดยเฉพาะตอนที่ทุกรายการมีสถานะเดียวกันหมด (เช่นผ่านการตรวจสอบ 100%) สีสถานะเดียวจะแยกกลุ่มไม่ได้
// ไอคอนเลือกให้สื่อสาระของแต่ละมาตรฐานตามเกณฑ์ สมศ.:
//   มฐ.1 คุณลักษณะของผู้สำเร็จการศึกษา -> หมวกบัณฑิต
//   มฐ.2 การจัดการอาชีวศึกษา          -> สถานศึกษา
//   มฐ.3 การสร้างสังคมแห่งการเรียนรู้   -> กลุ่มคน/ชุมชน
// ใช้โทนที่มีอยู่แล้วในธีม (primary / accent-gold / status-pending) วนซ้ำหากมีมาตรฐานมากกว่า 3
const PALETTE: { border: string; chip: string; icon: LucideIcon }[] = [
  { border: "border-l-primary", chip: "bg-primary/10 text-primary", icon: GraduationCap },
  { border: "border-l-accent-gold", chip: "bg-accent-gold/10 text-accent-gold", icon: School },
  { border: "border-l-status-pending", chip: "bg-status-pending/10 text-status-pending", icon: Users },
];

export function getStandardAccent(standardCode: string): { border: string; chip: string; icon: LucideIcon } {
  const n = parseInt(standardCode.replace(/\D/g, ""), 10);
  const index = Number.isNaN(n) ? 0 : n - 1;
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
