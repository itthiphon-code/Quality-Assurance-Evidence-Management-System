import { FileText, Link2 } from "lucide-react";

// ไอคอนประเภทเอกสารแนบ — ใช้ร่วมกันทุกหน้าที่แสดงรายการไฟล์ (แฟ้มสาธารณะ/คิวตรวจสอบ/รายละเอียดตัวชี้วัด)
// แทนการใช้อีโมจิ 🔗/📄 ซึ่งแสดงผลต่างกันในแต่ละระบบปฏิบัติการและดูไม่เป็นทางการ
export function AttachmentIcon({ type }: { type: "file" | "drive_link" }) {
  const Icon = type === "drive_link" ? Link2 : FileText;
  return <Icon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />;
}
