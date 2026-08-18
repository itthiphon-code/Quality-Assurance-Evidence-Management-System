import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { logAudit } from "../../middleware/audit";
import { buildObjectKey, deleteObject, putObject } from "../../storage/s3Client";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  canAccessEvidence,
  loadEvidenceWithIndicator,
} from "./evidence.service";

export const evidenceRouter = Router();
evidenceRouter.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error("UNSUPPORTED_FILE_TYPE"));
  },
});

// GET /api/evidence/review-queue — คิวตรวจสอบ (เฉพาะงานประกันคุณภาพ)
// ประกาศก่อน "/:id" เพื่อไม่ให้ Express จับ "review-queue" เป็นค่า :id
evidenceRouter.get("/review-queue", requireRole("qa"), async (_req, res, next) => {
  try {
    const items = await prisma.evidenceItem.findMany({
      where: { status: "review" },
      orderBy: { updatedAt: "asc" },
      include: {
        indicator: { include: { standard: true } },
        attachments: { orderBy: { uploadedAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
        reviewLogs: { orderBy: { createdAt: "desc" }, take: 1, include: { reviewer: { select: { name: true } } } },
      },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET /api/evidence/:id
evidenceRouter.get("/:id", async (req, res, next) => {
  try {
    const evidence = await loadEvidenceWithIndicator(req.params.id);
    if (!evidence) return res.status(404).json({ error: { message: "Evidence not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    const full = await prisma.evidenceItem.findUnique({
      where: { id: req.params.id },
      include: {
        attachments: { orderBy: { uploadedAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
        reviewLogs: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { name: true } } } },
      },
    });
    res.json(full);
  } catch (err) {
    next(err);
  }
});

const driveLinkSchema = z.object({
  type: z.literal("drive_link"),
  url: z.string().url(),
  filename: z.string().min(1).optional(),
});

// POST /api/evidence/:id/attachments — แนบไฟล์ (multipart, field "file") หรือลิงก์ Google Drive (JSON)
evidenceRouter.post("/:id/attachments", upload.single("file"), async (req, res, next) => {
  try {
    const evidence = await loadEvidenceWithIndicator(req.params.id);
    if (!evidence) return res.status(404).json({ error: { message: "Evidence not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    let attachment;
    if (req.file) {
      const key = buildObjectKey(evidence.id, req.file.originalname);
      await putObject(key, req.file.buffer, req.file.mimetype);
      attachment = await prisma.attachment.create({
        data: {
          evidenceId: evidence.id,
          type: "file",
          filename: req.file.originalname,
          url: key,
          size: req.file.size,
          uploadedById: req.user!.sub,
        },
      });
    } else {
      const input = driveLinkSchema.parse(req.body);
      attachment = await prisma.attachment.create({
        data: {
          evidenceId: evidence.id,
          type: "drive_link",
          filename: input.filename ?? "Google Drive Link",
          url: input.url,
          uploadedById: req.user!.sub,
        },
      });
    }

    // อัปโหลดครั้งแรก (todo) เริ่มนับว่ากำลังรวบรวม; ถ้าอยู่ระหว่างแก้ไข (revise) คงสถานะไว้จนกว่าจะส่งตรวจใหม่
    if (evidence.status === "todo") {
      await prisma.evidenceItem.update({ where: { id: evidence.id }, data: { status: "progress" } });
    }

    await logAudit({
      userId: req.user!.sub,
      action: "upload",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: evidence.id, type: attachment.type },
    });

    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/evidence/:id/attachments/:attachmentId
evidenceRouter.delete("/:id/attachments/:attachmentId", async (req, res, next) => {
  try {
    const evidence = await loadEvidenceWithIndicator(req.params.id);
    if (!evidence) return res.status(404).json({ error: { message: "Evidence not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.attachmentId } });
    if (!attachment || attachment.evidenceId !== evidence.id) {
      return res.status(404).json({ error: { message: "Attachment not found" } });
    }

    if (attachment.type === "file") {
      await deleteObject(attachment.url);
    }
    await prisma.attachment.delete({ where: { id: attachment.id } });

    await logAudit({
      userId: req.user!.sub,
      action: "delete_attachment",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: evidence.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/evidence/:id/submit — ส่งหลักฐานเข้าตรวจสอบ
evidenceRouter.post("/:id/submit", async (req, res, next) => {
  try {
    const evidence = await loadEvidenceWithIndicator(req.params.id);
    if (!evidence) return res.status(404).json({ error: { message: "Evidence not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    if (evidence.status !== "progress" && evidence.status !== "revise") {
      return res.status(400).json({ error: { message: "Evidence must be in progress or revise status to submit" } });
    }

    const attachmentCount = await prisma.attachment.count({ where: { evidenceId: evidence.id } });
    if (attachmentCount === 0) {
      return res.status(400).json({ error: { message: "At least one attachment is required before submitting" } });
    }

    const updated = await prisma.evidenceItem.update({ where: { id: evidence.id }, data: { status: "review" } });
    await prisma.reviewLog.create({
      data: { evidenceId: evidence.id, reviewerId: req.user!.sub, action: "submit" },
    });
    await logAudit({ userId: req.user!.sub, action: "submit", entityType: "EvidenceItem", entityId: evidence.id });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({
  action: z.enum(["approve", "revise"]),
  note: z.string().min(1).optional(),
});

// POST /api/evidence/:id/review — อนุมัติ/ส่งกลับแก้ไข (เฉพาะงานประกันคุณภาพ)
evidenceRouter.post("/:id/review", requireRole("qa"), async (req, res, next) => {
  try {
    const { action, note } = reviewSchema.parse(req.body);
    const evidence = await prisma.evidenceItem.findUnique({ where: { id: req.params.id } });
    if (!evidence) return res.status(404).json({ error: { message: "Evidence not found" } });

    if (evidence.status !== "review") {
      return res.status(400).json({ error: { message: "Evidence is not currently under review" } });
    }

    const nextStatus = action === "approve" ? "approved" : "revise";
    const updated = await prisma.evidenceItem.update({
      where: { id: evidence.id },
      data: { status: nextStatus },
    });
    await prisma.reviewLog.create({
      data: { evidenceId: evidence.id, reviewerId: req.user!.sub, action, note },
    });
    await logAudit({
      userId: req.user!.sub,
      action: action === "approve" ? "approve" : "revise",
      entityType: "EvidenceItem",
      entityId: evidence.id,
      meta: note ? { note } : undefined,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});
