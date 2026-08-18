import { prisma } from "../db/prisma";

interface AuditEntry {
  userId: string;
  action: string; // "login" | "upload" | "approve" | "revise" | "view" | "export" | ...
  entityType: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}

// บันทึก Audit Log แบบไม่บล็อก request หลัก — ใครทำอะไร เมื่อใด ตามข้อกำหนด Non-functional
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        meta: entry.meta as never,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}
