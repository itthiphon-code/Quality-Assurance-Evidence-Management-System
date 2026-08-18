import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { logAudit } from "../../middleware/audit";
import { getPresignedDownloadUrl } from "../../storage/s3Client";
import { canAccessEvidence } from "../evidence/evidence.service";

export const attachmentsRouter = Router();
attachmentsRouter.use(authMiddleware);

// GET /api/attachments/:id/download — คืนลิงก์เปิดไฟล์ (presigned URL) หรือลิงก์ Google Drive
// บันทึก Audit Log การเปิดดู ("ใครเปิดดูเมื่อใด" ตามข้อกำหนด Non-functional)
attachmentsRouter.get("/:id/download", async (req, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { evidence: { include: { indicator: true } } },
    });
    if (!attachment) return res.status(404).json({ error: { message: "Attachment not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, attachment.evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    const url = attachment.type === "file" ? await getPresignedDownloadUrl(attachment.url) : attachment.url;

    await logAudit({
      userId: req.user!.sub,
      action: "view",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: attachment.evidenceId },
    });

    res.json({ url });
  } catch (err) {
    next(err);
  }
});
