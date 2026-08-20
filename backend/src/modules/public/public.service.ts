import { prisma } from "../../db/prisma";

// แฟ้มตรวจเยี่ยมสาธารณะ: มาตรฐาน -> ตัวชี้วัด -> เฉพาะหลักฐานที่ผ่านการตรวจสอบแล้ว
// เข้าถึงได้โดยไม่ต้องล็อกอิน (เดิมเป็นสิทธิ์ของบทบาทผู้ประเมิน สมศ. ที่ต้องล็อกอิน)
// ส่งเฉพาะข้อมูลที่ใช้แสดงผลของเอกสารแนบ — ไม่ส่ง url จริงออกไป เพราะต้องขอผ่าน
// /api/public/attachments/:id/download เท่านั้น เพื่อให้บันทึก Audit Log การเปิดดูทุกครั้ง
export async function getApprovedFolder() {
  return prisma.standard.findMany({
    orderBy: { code: "asc" },
    include: {
      indicators: {
        orderBy: { code: "asc" },
        include: {
          collectionMethods: true,
          dataSources: true,
          evidenceItems: {
            where: { status: "approved" },
            orderBy: { order: "asc" },
            include: {
              attachments: {
                // title = ชื่อเอกสารที่ผู้ใช้ตั้งไว้ ต้องส่งออกมาด้วย ไม่งั้นหน้าสาธารณะจะแสดงชื่อไฟล์ดิบเสมอ
                select: { id: true, type: true, filename: true, title: true, uploadedAt: true },
                orderBy: { uploadedAt: "desc" },
              },
            },
          },
        },
      },
    },
  });
}
