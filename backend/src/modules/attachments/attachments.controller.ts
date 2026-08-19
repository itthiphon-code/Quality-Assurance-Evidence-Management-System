import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { logAudit } from "../../middleware/audit";
import { streamAttachment } from "../../storage/streamAttachment";
import { canAccessEvidence } from "../evidence/evidence.service";

export const attachmentsRouter = Router();
attachmentsRouter.use(authMiddleware);

// GET /api/attachments/:id/download — ส่งไฟล์ให้ผู้ใช้โดยตรง หรือคืนลิงก์ Google Drive เป็น JSON
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

    await logAudit({
      userId: req.user!.sub,
      action: "view",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: attachment.evidenceId },
    });

    // ลิงก์ Google Drive ไม่ใช่ไฟล์ในระบบ จึงคืนเป็น URL ให้หน้าเว็บพาไปเปิดที่ Drive เอง
    if (attachment.type === "drive_link") return res.json({ url: attachment.url });

    await streamAttachment(res, attachment.url, attachment.filename);
  } catch (err) {
    next(err);
  }
});
