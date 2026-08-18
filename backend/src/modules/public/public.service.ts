import { prisma } from "../../db/prisma";

// แฟ้มตรวจเยี่ยมสาธารณะ: มาตรฐาน -> ตัวชี้วัด -> เฉพาะหลักฐานที่ผ่านการตรวจสอบแล้ว
// เข้าถึงได้โดยไม่ต้องล็อกอิน (เดิมเป็นสิทธิ์ของบทบาทผู้ประเมิน สมศ. ที่ต้องล็อกอิน)
// แสดงเฉพาะ id/type/filename ของเอกสารแนบ — URL จริงต้องขอผ่าน /api/public/attachments/:id/download
// เท่านั้น เพื่อให้บันทึก Audit Log การเปิดดูทุกครั้ง
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
                select: { id: true, type: true, filename: true, uploadedAt: true },
                orderBy: { uploadedAt: "desc" },
              },
            },
          },
        },
      },
    },
  });
}
