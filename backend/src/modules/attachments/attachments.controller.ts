import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { authMiddleware } from "../../middleware/auth";
import { logAudit } from "../../middleware/audit";
import { streamAttachment } from "../../storage/streamAttachment";
import { buildDownloadName } from "../../storage/downloadName";
import { verifyAccessToken } from "../auth/auth.service";
import { canAccessEvidence } from "../evidence/evidence.service";

export const attachmentsRouter = Router();

const DOWNLOAD_TOKEN_TTL_SECONDS = 60;

interface DownloadTokenPayload {
  sub: string;
  role: string;
  attachmentId: string;
  purpose: "download";
}

// POST /api/attachments/:id/download-token — ออกตั๋วอายุสั้นสำหรับเปิดไฟล์ในแท็บใหม่
//
// การเปิดแท็บใหม่แนบ Authorization header ไปด้วยไม่ได้ และเบราว์เซอร์ (Chromium)
// บล็อกการพาแท็บไปยัง blob: URL จึงต้องให้แท็บชี้ไปยัง URL ปกติที่พิสูจน์ตัวตนได้เอง
// ตั๋วนี้ผูกกับไฟล์ใบเดียวและหมดอายุใน 1 นาที เพื่อจำกัดความเสี่ยงจากการที่ token อยู่ใน URL
attachmentsRouter.post("/:id/download-token", authMiddleware, async (req, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { evidence: true },
    });
    if (!attachment) return res.status(404).json({ error: { message: "Attachment not found" } });

    const allowed = await canAccessEvidence(req.user!.sub, req.user!.role, attachment.evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    const payload: DownloadTokenPayload = {
      sub: req.user!.sub,
      role: req.user!.role,
      attachmentId: attachment.id,
      purpose: "download",
    };
    const token = jwt.sign(payload, env.jwtAccessSecret, { expiresIn: DOWNLOAD_TOKEN_TTL_SECONDS });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// รับตัวตนได้ 2 ทาง: Authorization header (เรียกจากโค้ด) หรือ ?t= (เปิดตรงจากแท็บใหม่)
function resolveDownloadIdentity(
  req: { headers: { authorization?: string }; query: Record<string, unknown>; params: { id: string } },
): { sub: string; role: string } | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      return { sub: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }

  const raw = req.query.t;
  if (typeof raw !== "string") return null;
  try {
    const payload = jwt.verify(raw, env.jwtAccessSecret) as DownloadTokenPayload;
    // ตั๋วต้องออกมาเพื่อการเปิดไฟล์ และต้องเป็นไฟล์ใบเดียวกับที่ร้องขอเท่านั้น
    if (payload.purpose !== "download" || payload.attachmentId !== req.params.id) return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

// GET /api/attachments/:id/download — ส่งไฟล์ให้ผู้ใช้โดยตรง หรือคืนลิงก์ Google Drive เป็น JSON
// บันทึก Audit Log การเปิดดู ("ใครเปิดดูเมื่อใด" ตามข้อกำหนด Non-functional)
attachmentsRouter.get("/:id/download", async (req, res, next) => {
  try {
    const identity = resolveDownloadIdentity(req);
    if (!identity) return res.status(401).json({ error: { message: "Missing or invalid credentials" } });

    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { evidence: { include: { indicator: true } } },
    });
    if (!attachment) return res.status(404).json({ error: { message: "Attachment not found" } });

    const allowed = await canAccessEvidence(identity.sub, identity.role, attachment.evidence.indicatorId);
    if (!allowed) return res.status(403).json({ error: { message: "Forbidden" } });

    await logAudit({
      userId: identity.sub,
      action: "view",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: attachment.evidenceId },
    });

    // ลิงก์ Google Drive ไม่ใช่ไฟล์ในระบบ — พาไปที่ Drive โดยตรง
    if (attachment.type === "drive_link") return res.redirect(attachment.url);

    await streamAttachment(res, attachment.url, buildDownloadName(attachment.filename, attachment.title));
  } catch (err) {
    next(err);
  }
});
