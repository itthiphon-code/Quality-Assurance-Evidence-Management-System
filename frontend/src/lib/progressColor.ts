// สีแถบ/ตัวเลขความคืบหน้าไล่ระดับตามเกณฑ์ % ให้เห็นความพร้อม/ความเสี่ยงแบบเดาสายตาได้ทันที
// ใช้ร่วมกันระหว่างตารางความพร้อม (IndicatorReadinessTable) และกริดภาพรวม (IndicatorReadinessGrid)
export function progressColorClass(pct: number): string {
  if (pct >= 100) return "bg-status-success";
  if (pct >= 60) return "bg-accent-gold";
  if (pct >= 40) return "bg-status-warning";
  return "bg-status-danger";
}

export function progressTextColorClass(pct: number): string {
  if (pct >= 100) return "text-status-success";
  if (pct >= 60) return "text-accent-gold";
  if (pct >= 40) return "text-status-warning";
  return "text-status-danger";
}
