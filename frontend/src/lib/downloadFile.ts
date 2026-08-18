import { apiClient } from "./apiClient";

// ดาวน์โหลดไฟล์ผ่าน API ที่ต้องใช้ JWT (a[href] ธรรมดาแนบ header ไม่ได้)
// ใช้ axios ดึงเป็น blob แล้วจำลองคลิกลิงก์ดาวน์โหลดชั่วคราว
export async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await apiClient.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
