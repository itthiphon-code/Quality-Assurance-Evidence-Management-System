import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";

export const notificationsRouter = Router();
notificationsRouter.use(authMiddleware);

// GET /api/notifications — รายการแจ้งเตือนล่าสุด (อ้างอิงจาก ReviewLog โดยตรง ไม่มีตารางแยก)
// ครู: ผลตรวจ (อนุมัติ/ส่งกลับแก้ไข) ของหลักฐานในตัวชี้วัดที่ตนรับผิดชอบ
// งานประกันคุณภาพ: รายการที่เพิ่งถูกส่งเข้าตรวจ (รอดำเนินการ)
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const { role, sub } = req.user!;

    let logs: Awaited<ReturnType<typeof prisma.reviewLog.findMany>> = [];
    if (role === "teacher") {
      logs = await prisma.reviewLog.findMany({
        where: {
          action: { in: ["approve", "revise"] },
          evidence: { indicator: { assignments: { some: { userId: sub } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reviewer: { select: { name: true } },
          evidence: { include: { indicator: { select: { code: true, nameTh: true, nameEn: true } } } },
        },
      });
    } else if (role === "qa") {
      logs = await prisma.reviewLog.findMany({
        where: { action: "submit" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reviewer: { select: { name: true } },
          evidence: { include: { indicator: { select: { code: true, nameTh: true, nameEn: true } } } },
        },
      });
    }

    res.json(logs);
  } catch (err) {
    next(err);
  }
});
