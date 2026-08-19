import { Router } from "express";
import { prisma } from "../../db/prisma";
import { logAudit } from "../../middleware/audit";
import { streamAttachment } from "../../storage/streamAttachment";
import { computeDashboardSummary } from "../dashboard/dashboard.service";
import { getApprovedFolder } from "./public.service";

// เส้นทางสาธารณะ — ไม่มี authMiddleware โดยเจตนา เข้าถึงได้โดยไม่ต้องล็อกอิน
// (แทนที่บทบาทผู้ประเมิน สมศ. ที่เดิมต้องล็อกอิน) แสดงเฉพาะสถิติภาพรวมและหลักฐานที่ผ่านการตรวจสอบแล้วเท่านั้น
export const publicRouter = Router();

// GET /api/public/summary — สถิติความพร้อมโดยรวม (ข้อมูลเดียวกับ /api/dashboard/summary)
publicRouter.get("/summary", async (_req, res, next) => {
  try {
    const summary = await computeDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/public/folder — แฟ้มตรวจเยี่ยม: เฉพาะหลักฐานที่ผ่านการตรวจสอบแล้ว
publicRouter.get("/folder", async (_req, res, next) => {
  try {
    const folder = await getApprovedFolder();
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

// GET /api/public/attachments/:id/download — เปิดไฟล์/ลิงก์ Google Drive ของหลักฐานที่ผ่านการตรวจสอบแล้ว
// บันทึก Audit Log แบบไม่ระบุตัวตน (userId: null) — ยังคงมีร่องรอยว่าเปิดดูเมื่อใด แม้ไม่ได้ล็อกอิน
publicRouter.get("/attachments/:id/download", async (req, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { evidence: true },
    });
    if (!attachment || attachment.evidence.status !== "approved") {
      return res.status(404).json({ error: { message: "Attachment not found" } });
    }

    await logAudit({
      userId: null,
      action: "view",
      entityType: "Attachment",
      entityId: attachment.id,
      meta: { evidenceId: attachment.evidenceId, public: true },
    });

    // เปิดตรงจากแท็บใหม่ได้เลย จึงพาไป Google Drive ด้วย redirect แทนการคืน JSON
    if (attachment.type === "drive_link") return res.redirect(attachment.url);

    await streamAttachment(res, attachment.url, attachment.filename);
  } catch (err) {
    next(err);
  }
});
