import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

// ร่องรอยการใช้งานเป็นข้อมูลอ่อนไหว (บอกได้ว่าใครทำอะไรเมื่อไร) จึงจำกัดให้เฉพาะงานประกันคุณภาพ
export const auditRouter = Router();
auditRouter.use(authMiddleware, requireRole("qa"));

const MAX_PAGE_SIZE = 100;

const listQuerySchema = z.object({
  action: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(50),
});

// GET /api/audit-logs — รายการร่องรอยการใช้งาน เรียงใหม่ไปเก่า พร้อมแบ่งหน้า
auditRouter.get("/", async (req, res, next) => {
  try {
    const { action, page, pageSize } = listQuerySchema.parse(req.query);
    const where = action ? { action } : undefined;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  } catch (err) {
    next(err);
  }
});

// GET /api/audit-logs/actions — ชนิดการกระทำที่มีอยู่จริงในฐานข้อมูล ใช้สร้างตัวกรองในหน้าเว็บ
// (ดึงจากข้อมูลจริงแทนการฮาร์ดโค้ด เพื่อให้ตัวกรองตามทันเมื่อมี action ใหม่เพิ่มภายหลัง)
auditRouter.get("/actions", async (_req, res, next) => {
  try {
    const rows = await prisma.auditLog.groupBy({ by: ["action"], _count: true });
    const actions = rows
      .map((r) => ({ action: r.action, count: r._count }))
      .sort((a, b) => b.count - a.count);
    res.json(actions);
  } catch (err) {
    next(err);
  }
});
