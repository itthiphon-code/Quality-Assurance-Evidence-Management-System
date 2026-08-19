import { apiClient } from "./apiClient";

// ปล่อย object URL ทิ้งหลังเปิดแท็บไปแล้วสักพัก ไม่งั้นไฟล์จะค้างในหน่วยความจำจนกว่าจะปิดหน้า
const OBJECT_URL_TTL_MS = 60_000;

// เปิดไฟล์แนบในแท็บใหม่ — endpoint จะบันทึก Audit Log การเปิดดูให้ทุกครั้ง
//
// backend ตอบได้ 2 แบบ:
//   - ไฟล์ในระบบ  -> ส่งตัวไฟล์มาเลย (สตรีมผ่าน backend ไม่ใช้ presigned URL เพราะ URL นั้น
//                    ถูกเซ็นด้วยที่อยู่ภายใน Docker ซึ่งเบราว์เซอร์ผู้ใช้เข้าไม่ถึง)
//   - ลิงก์ Drive -> ตอบเป็น JSON { url } ให้พาไปเปิดที่ Google Drive
// จึงต้องรับเป็น blob แล้วดูจากชนิดข้อมูลว่าเป็นกรณีไหน
async function openFromEndpoint(path: string) {
  const res = await apiClient.get(path, { responseType: "blob" });
  const blob = res.data as Blob;

  if (blob.type.includes("application/json")) {
    const { url } = JSON.parse(await blob.text()) as { url: string };
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), OBJECT_URL_TTL_MS);
}

export function openAttachment(attachmentId: string) {
  return openFromEndpoint(`/attachments/${attachmentId}/download`);
}

// เหมือน openAttachment แต่ใช้ endpoint สาธารณะ (ไม่ต้องล็อกอิน) สำหรับหน้าแฟ้มตรวจเยี่ยมสาธารณะ
export function openPublicAttachment(attachmentId: string) {
  return openFromEndpoint(`/public/attachments/${attachmentId}/download`);
}
