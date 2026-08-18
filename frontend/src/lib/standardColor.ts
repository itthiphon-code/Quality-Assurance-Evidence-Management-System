// สีประจำมาตรฐาน (ไม่ใช่สีสถานะ) — ใช้แยกกลุ่มมาตรฐานด้วยสายตาในมุมมองที่เป็นการ์ด/กริด
// โดยเฉพาะตอนที่ทุกรายการมีสถานะเดียวกันหมด (เช่นผ่านการตรวจสอบ 100%) สีสถานะเดียวจะแยกกลุ่มไม่ได้
// ใช้โทนที่มีอยู่แล้วในธีม (primary / accent-gold / status-pending) วนซ้ำหากมีมาตรฐานมากกว่า 3
const PALETTE = [
  { border: "border-l-primary", chip: "bg-primary/10 text-primary" },
  { border: "border-l-accent-gold", chip: "bg-accent-gold/10 text-accent-gold" },
  { border: "border-l-status-pending", chip: "bg-status-pending/10 text-status-pending" },
];

export function getStandardAccent(standardCode: string): { border: string; chip: string } {
  const n = parseInt(standardCode.replace(/\D/g, ""), 10);
  const index = Number.isNaN(n) ? 0 : n - 1;
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
