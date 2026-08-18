import { apiClient } from "./apiClient";

// เปิดไฟล์/ลิงก์ Google Drive ในแท็บใหม่ — เรียก endpoint ที่บันทึก Audit Log การเปิดดูด้วย
export async function openAttachment(attachmentId: string) {
  const res = await apiClient.get<{ url: string }>(`/attachments/${attachmentId}/download`);
  window.open(res.data.url, "_blank", "noopener,noreferrer");
}

// เหมือน openAttachment แต่ใช้ endpoint สาธารณะ (ไม่ต้องล็อกอิน) สำหรับหน้าแฟ้มตรวจเยี่ยมสาธารณะ
export async function openPublicAttachment(attachmentId: string) {
  const res = await apiClient.get<{ url: string }>(`/public/attachments/${attachmentId}/download`);
  window.open(res.data.url, "_blank", "noopener,noreferrer");
}
