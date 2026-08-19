import type { Response } from "express";
import { getObjectStream } from "./s3Client";

// ส่งไฟล์แนบจาก MinIO ไปยังผู้ใช้ผ่าน backend — ใช้ร่วมกันทั้งเส้นทางที่ต้องล็อกอิน
// (attachments.controller) และเส้นทางสาธารณะ (public.controller) เพื่อให้พฤติกรรมตรงกัน
export async function streamAttachment(res: Response, key: string, filename: string): Promise<void> {
  const { body, contentType, contentLength } = await getObjectStream(key);

  res.setHeader("Content-Type", contentType);
  if (contentLength !== undefined) res.setHeader("Content-Length", String(contentLength));
  // inline = ให้เบราว์เซอร์เปิดดูในแท็บได้เลย (PDF/รูป) แทนการบังคับดาวน์โหลด
  // filename* ตาม RFC 5987 จำเป็นสำหรับชื่อไฟล์ภาษาไทย ซึ่งใส่ในรูปแบบ filename= ธรรมดาไม่ได้
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(filename)}`);

  // สตรีมพังกลางคัน (เช่น MinIO ตัดการเชื่อมต่อ) — ปิด response ทิ้งไม่ให้ค้าง
  body.on("error", () => res.destroy());
  body.pipe(res);
}
