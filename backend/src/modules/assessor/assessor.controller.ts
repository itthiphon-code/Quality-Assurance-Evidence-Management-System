import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const assessorRouter = Router();
assessorRouter.use(authMiddleware, requireRole("assessor"));

// GET /api/assessor/folder — แฟ้มตรวจเยี่ยม: มาตรฐาน -> ตัวชี้วัด -> เฉพาะหลักฐานที่ผ่านการตรวจสอบแล้ว
// อ่านอย่างเดียว — ไม่มีการให้คะแนนหรือแก้ไขใด ๆ ตามข้อกำหนด (แสดงเฉพาะ id/type/filename ของเอกสารแนบ
// ส่วน URL จริงต้องขอผ่าน /api/attachments/:id/download เท่านั้น เพื่อให้บันทึก Audit Log การเปิดดูทุกครั้ง)
assessorRouter.get("/folder", async (_req, res, next) => {
  try {
    const standards = await prisma.standard.findMany({
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

    res.json(standards);
  } catch (err) {
    next(err);
  }
});
