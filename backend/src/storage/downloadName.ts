// ชื่อไฟล์ที่ส่งให้ผู้ใช้ตอนดาวน์โหลด
//
// ถ้าผู้ใช้ตั้งชื่อเอกสารไว้ ให้ใช้ชื่อนั้น แต่ต้องคงนามสกุลของไฟล์จริงไว้เสมอ
// มิฉะนั้นไฟล์ที่ดาวน์โหลดจะไม่มีนามสกุล และระบบปฏิบัติการจะเปิดด้วยโปรแกรมที่ถูกต้องไม่ได้
export function buildDownloadName(filename: string, title: string | null): string {
  if (!title?.trim()) return filename;

  const dot = filename.lastIndexOf(".");
  const ext = dot > 0 ? filename.slice(dot) : "";
  const cleanTitle = title.trim();

  // ผู้ใช้พิมพ์นามสกุลมาเองแล้ว ก็ไม่ต้องต่อซ้ำ
  if (ext && cleanTitle.toLowerCase().endsWith(ext.toLowerCase())) return cleanTitle;
  return `${cleanTitle}${ext}`;
}
