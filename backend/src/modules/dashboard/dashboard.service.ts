import { prisma } from "../../db/prisma";

export interface StatusCounts {
  todo: number;
  progress: number;
  review: number;
  approved: number;
  revise: number;
  total: number;
}

export interface StandardCounts extends StatusCounts {
  standardId: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface IndicatorReadiness {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  standardCode: string;
  total: number;
  approved: number;
  hasRevise: boolean;
  pctComplete: number;
}

export interface DashboardSummary {
  overall: StatusCounts;
  byStandard: StandardCounts[];
  byIndicator: IndicatorReadiness[];
}

function emptyCounts(): StatusCounts {
  return { todo: 0, progress: 0, review: 0, approved: 0, revise: 0, total: 0 };
}

// สรุปภาพรวมความคืบหน้าหลักฐานทั้งระบบ — ใช้ร่วมกันโดยทั้งแดชบอร์ด (dashboard.controller.ts)
// และรายงาน (reports.controller.ts) รวมข้อมูลใน JS แทน SQL aggregation เนื่องจากชุดข้อมูลเล็ก (~54 รายการ)
export async function computeDashboardSummary(): Promise<DashboardSummary> {
  const items = await prisma.evidenceItem.findMany({
    select: {
      status: true,
      indicator: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
          standard: { select: { id: true, code: true, nameTh: true, nameEn: true } },
        },
      },
    },
  });

  const overall = emptyCounts();
  const byStandardMap = new Map<string, StandardCounts>();
  const byIndicatorMap = new Map<string, Omit<IndicatorReadiness, "pctComplete">>();

  for (const item of items) {
    overall.total++;
    overall[item.status]++;

    const std = item.indicator.standard;
    if (!byStandardMap.has(std.id)) {
      byStandardMap.set(std.id, { ...emptyCounts(), standardId: std.id, code: std.code, nameTh: std.nameTh, nameEn: std.nameEn });
    }
    const stdEntry = byStandardMap.get(std.id)!;
    stdEntry.total++;
    stdEntry[item.status]++;

    const ind = item.indicator;
    if (!byIndicatorMap.has(ind.id)) {
      byIndicatorMap.set(ind.id, {
        id: ind.id,
        code: ind.code,
        nameTh: ind.nameTh,
        nameEn: ind.nameEn,
        standardCode: std.code,
        total: 0,
        approved: 0,
        hasRevise: false,
      });
    }
    const indEntry = byIndicatorMap.get(ind.id)!;
    indEntry.total++;
    if (item.status === "approved") indEntry.approved++;
    if (item.status === "revise") indEntry.hasRevise = true;
  }

  const byStandard = Array.from(byStandardMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  const byIndicator = Array.from(byIndicatorMap.values())
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((ind) => ({ ...ind, pctComplete: ind.total > 0 ? Math.round((ind.approved / ind.total) * 100) : 0 }));

  return { overall, byStandard, byIndicator };
}
