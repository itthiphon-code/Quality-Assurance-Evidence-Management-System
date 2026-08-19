import { apiClient } from "./apiClient";

function apiUrl(path: string): string {
  const base = apiClient.defaults.baseURL ?? "/api";
  return `${base.replace(/\/$/, "")}${path}`;
}

// เปิดไฟล์แนบในแท็บใหม่ — endpoint จะบันทึก Audit Log การเปิดดูให้ทุกครั้ง
//
// ทั้งสองฟังก์ชันต้องพาแท็บไปยัง "URL ปกติ" ไม่ใช่ blob: URL
// เพราะเบราว์เซอร์ (Chromium) บล็อกการพาแท็บที่เปิดใหม่ไปยัง blob: URL แท็บจะค้างอยู่ที่ about:blank

// หน้าแฟ้มสาธารณะไม่ต้องล็อกอิน จึงเปิดได้ทันทีในจังหวะคลิก ไม่ต้องรออะไรก่อน
// (ปลอดภัยที่สุดจากการถูกบล็อกป๊อปอัป เพราะไม่มี await คั่น)
export function openPublicAttachment(attachmentId: string) {
  window.open(apiUrl(`/public/attachments/${attachmentId}/download`), "_blank", "noopener,noreferrer");
}

// เส้นทางที่ต้องล็อกอิน: แท็บใหม่แนบ Authorization header ไปเองไม่ได้
// จึงขอ "ตั๋วอายุสั้น" (1 นาที ผูกกับไฟล์ใบเดียว) มาใส่ใน URL แทน
export async function openAttachment(attachmentId: string) {
  // เปิดแท็บทันทีในจังหวะที่ผู้ใช้คลิก ก่อนจะ await ขอตั๋ว
  // ถ้าเปิดหลัง await เบราว์เซอร์จะถือว่าไม่ได้เกิดจากการกระทำของผู้ใช้แล้วบล็อกป๊อปอัปทิ้ง
  const tab = window.open("", "_blank");

  try {
    const res = await apiClient.post<{ token: string }>(`/attachments/${attachmentId}/download-token`);
    const url = apiUrl(`/attachments/${attachmentId}/download?t=${encodeURIComponent(res.data.token)}`);
    if (tab && !tab.closed) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      // ป๊อปอัปถูกบล็อกตั้งแต่แรก — เปิดอีกครั้งเผื่อผู้ใช้อนุญาตไว้แล้ว
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    tab?.close();
    throw err;
  }
}
