import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { logAudit } from "../../middleware/audit";
import { isAssignedToIndicator } from "./indicators.service";

export const indicatorsRouter = Router();
indicatorsRouter.use(authMiddleware);

// GET /api/indicators — รายการตัวชี้วัด
// ครู: เห็นเฉพาะตัวชี้วัดที่ตนเองได้รับมอบหมาย (ไม่สนใจ query param — ป้องกันเห็นงานคนอื่น)
// บทบาทอื่น: เห็นทั้งหมด
indicatorsRouter.get("/", async (req, res, next) => {
  try {
    const scopeToSelf = req.user!.role === "teacher";

    const indicators = await prisma.indicator.findMany({
      where: scopeToSelf ? { assignments: { some: { userId: req.user!.sub } } } : undefined,
      orderBy: { code: "asc" },
      include: {
        standard: true,
        evidenceItems: { select: { id: true, status: true }, orderBy: { order: "asc" } },
        collectionMethods: true,
        dataSources: true,
        assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    res.json(indicators);
  } catch (err) {
    next(err);
  }
});

async function canAccessIndicatorDetail(userId: string, role: string, indicatorId: string): Promise<boolean> {
  if (role === "qa") return true;
  if (role === "teacher") return isAssignedToIndicator(userId, indicatorId);
  // exec: ไม่มีสิทธิ์เข้าถึงรายละเอียดตัวชี้วัดระดับนี้ (ใช้แดชบอร์ดสรุปแทน)
  return false;
}

// GET /api/indicators/:id — รายละเอียดพร้อมหลักฐาน/เอกสารแนบ/ประวัติตรวจล่าสุด
indicatorsRouter.get("/:id", async (req, res, next) => {
  try {
    const allowed = await canAccessIndicatorDetail(req.user!.sub, req.user!.role, req.params.id);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    const indicator = await prisma.indicator.findUnique({
      where: { id: req.params.id },
      include: {
        standard: true,
        collectionMethods: true,
        dataSources: true,
        assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
        evidenceItems: {
          orderBy: { order: "asc" },
          include: {
            attachments: { orderBy: { uploadedAt: "desc" } },
            reviewLogs: { orderBy: { createdAt: "desc" }, take: 1, include: { reviewer: { select: { name: true } } } },
          },
        },
      },
    });

    if (!indicator) return res.status(404).json({ error: { message: "Indicator not found" } });
    res.json(indicator);
  } catch (err) {
    next(err);
  }
});

const updateIndicatorSchema = z.object({
  nameTh: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  visitMethod: z.string().min(1).optional(),
  ownerDepartment: z.string().min(1).optional(),
});

// PATCH /api/indicators/:id — แก้ไขข้อมูลตัวชี้วัด (เฉพาะงานประกันคุณภาพ)
indicatorsRouter.patch("/:id", requireRole("qa"), async (req, res, next) => {
  try {
    const data = updateIndicatorSchema.parse(req.body);
    const indicator = await prisma.indicator.update({ where: { id: req.params.id }, data });
    await logAudit({
      userId: req.user!.sub,
      action: "update_indicator",
      entityType: "Indicator",
      entityId: indicator.id,
    });
    res.json(indicator);
  } catch (err) {
    next(err);
  }
});

const assignSchema = z.object({ userId: z.string().min(1) });

// POST /api/indicators/:id/assignments — มอบหมายผู้รับผิดชอบ (เฉพาะงานประกันคุณภาพ)
indicatorsRouter.post("/:id/assignments", requireRole("qa"), async (req, res, next) => {
  try {
    const { userId } = assignSchema.parse(req.body);
    const assignment = await prisma.assignment.upsert({
      where: { userId_indicatorId: { userId, indicatorId: req.params.id } },
      update: {},
      create: { userId, indicatorId: req.params.id },
    });
    await logAudit({
      userId: req.user!.sub,
      action: "assign",
      entityType: "Indicator",
      entityId: req.params.id,
      meta: { assignedUserId: userId },
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/indicators/:id/assignments/:userId — ยกเลิกมอบหมาย (เฉพาะงานประกันคุณภาพ)
indicatorsRouter.delete("/:id/assignments/:userId", requireRole("qa"), async (req, res, next) => {
  try {
    await prisma.assignment.delete({
      where: { userId_indicatorId: { userId: req.params.userId, indicatorId: req.params.id } },
    });
    await logAudit({
      userId: req.user!.sub,
      action: "unassign",
      entityType: "Indicator",
      entityId: req.params.id,
      meta: { unassignedUserId: req.params.userId },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
