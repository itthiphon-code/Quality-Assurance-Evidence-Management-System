import { apiClient } from "./apiClient";

// เปิดไฟล์/ลิงก์ Google Drive ในแท็บใหม่ — เรียก endpoint ที่บันทึก Audit Log การเปิดดูด้วย
export async function openAttachment(attachmentId: string) {
  const res = await apiClient.get<{ url: string }>(`/attachments/${attachmentId}/download`);
  window.open(res.data.url, "_blank", "noopener,noreferrer");
}
