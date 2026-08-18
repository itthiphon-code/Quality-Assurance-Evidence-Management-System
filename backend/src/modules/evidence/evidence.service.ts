import { prisma } from "../../db/prisma";
import { isAssignedToIndicator } from "../indicators/indicators.service";

export async function loadEvidenceWithIndicator(evidenceId: string) {
  return prisma.evidenceItem.findUnique({
    where: { id: evidenceId },
    include: { indicator: true },
  });
}

// อนุญาตให้ครูที่ได้รับมอบหมายตัวชี้วัดนั้น หรืองานประกันคุณภาพ เข้าถึง/แก้ไขหลักฐานได้
export async function canAccessEvidence(userId: string, role: string, indicatorId: string): Promise<boolean> {
  if (role === "qa") return true;
  if (role === "teacher") return isAssignedToIndicator(userId, indicatorId);
  return false;
}

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/gif",
  "application/zip",
  "application/x-zip-compressed",
]);

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB ตามสเปก
