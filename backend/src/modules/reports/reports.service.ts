import { prisma } from "../../db/prisma";
import { computeDashboardSummary, type IndicatorReadiness } from "../dashboard/dashboard.service";

export interface IndicatorReadinessWithAssignees extends IndicatorReadiness {
  assignees: string[];
}

export interface EvidenceDetailRow {
  standardCode: string;
  indicatorCode: string;
  indicatorNameTh: string;
  indicatorNameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  status: string;
  attachmentCount: number;
  lastUploadedBy: string | null;
  lastUploadedAt: Date | null;
  latestReviewerNote: string | null;
}

export interface ReportData {
  generatedAt: Date;
  overall: Awaited<ReturnType<typeof computeDashboardSummary>>["overall"];
  byStandard: Awaited<ReturnType<typeof computeDashboardSummary>>["byStandard"];
  byIndicator: IndicatorReadinessWithAssignees[];
  evidenceDetail: EvidenceDetailRow[];
}

export async function getReportData(): Promise<ReportData> {
  const [summary, indicatorsWithAssignments, evidenceItems] = await Promise.all([
    computeDashboardSummary(),
    prisma.indicator.findMany({
      select: { id: true, assignments: { select: { user: { select: { name: true } } } } },
    }),
    prisma.evidenceItem.findMany({
      orderBy: [{ indicator: { code: "asc" } }, { order: "asc" }],
      include: {
        indicator: { include: { standard: true } },
        attachments: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
          include: { uploadedBy: { select: { name: true } } },
        },
        reviewLogs: { orderBy: { createdAt: "desc" }, take: 1, include: { reviewer: { select: { name: true } } } },
        _count: { select: { attachments: true } },
      },
    }),
  ]);

  const assigneesByIndicator = new Map(
    indicatorsWithAssignments.map((ind) => [ind.id, ind.assignments.map((a) => a.user.name)]),
  );

  const byIndicator: IndicatorReadinessWithAssignees[] = summary.byIndicator.map((ind) => ({
    ...ind,
    assignees: assigneesByIndicator.get(ind.id) ?? [],
  }));

  const evidenceDetail: EvidenceDetailRow[] = evidenceItems.map((item) => {
    const lastAttachment = item.attachments[0];
    const latestLog = item.reviewLogs[0];
    return {
      standardCode: item.indicator.standard.code,
      indicatorCode: item.indicator.code,
      indicatorNameTh: item.indicator.nameTh,
      indicatorNameEn: item.indicator.nameEn,
      descriptionTh: item.descriptionTh,
      descriptionEn: item.descriptionEn,
      status: item.status,
      attachmentCount: item._count.attachments,
      lastUploadedBy: lastAttachment?.uploadedBy.name ?? null,
      lastUploadedAt: lastAttachment?.uploadedAt ?? null,
      latestReviewerNote: latestLog?.note ?? null,
    };
  });

  return {
    generatedAt: new Date(),
    overall: summary.overall,
    byStandard: summary.byStandard,
    byIndicator,
    evidenceDetail,
  };
}
