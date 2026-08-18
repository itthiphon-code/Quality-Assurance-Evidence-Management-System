import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";

export const standardsRouter = Router();

// GET /api/standards — รายการมาตรฐานพร้อมตัวชี้วัดซ้อน (nested)
// ทุกบทบาทที่ล็อกอินแล้วเข้าถึงได้ (ใช้แสดงในแดชบอร์ดของทั้ง 4 บทบาท)
standardsRouter.get("/", authMiddleware, async (_req, res, next) => {
  try {
    const standards = await prisma.standard.findMany({
      orderBy: { code: "asc" },
      include: {
        indicators: {
          orderBy: { code: "asc" },
          include: {
            _count: { select: { evidenceItems: true } },
          },
        },
      },
    });
    res.json(standards);
  } catch (err) {
    next(err);
  }
});
