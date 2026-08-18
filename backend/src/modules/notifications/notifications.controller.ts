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

    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { notificationsReadAt: true },
    });
    const readAt = user?.notificationsReadAt;
    // ยังไม่เคยเปิดดูเลย = ถือว่ายังไม่อ่านทั้งหมด
    const unreadCount = readAt ? logs.filter((log) => log.createdAt > readAt).length : logs.length;

    res.json({ items: logs, unreadCount });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read — บันทึกว่าเปิดดูการแจ้งเตือนแล้ว (ล้างตัวเลขบนกระดิ่ง)
notificationsRouter.post("/read", async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { notificationsReadAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
