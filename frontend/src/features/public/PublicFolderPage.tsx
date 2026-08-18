import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardList, FileCheck2, LogIn, Target } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { openPublicAttachment } from "../../lib/attachments";
import type { DashboardSummary } from "../../lib/useDashboardSummary";
import { StatusDonutChart } from "../../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../../components/charts/StandardProgressChart";
import { StandardComparisonBars } from "../../components/charts/StandardComparisonBars";
import { IndicatorReadinessGrid } from "../../components/IndicatorReadinessGrid";
import { AttachmentIcon } from "../../components/AttachmentIcon";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { DashboardSkeleton } from "../../components/ui/Skeleton";

interface AttachmentSummary {
  id: string;
  type: "file" | "drive_link";
  filename: string;
}

interface EvidenceItemSummary {
  id: string;
  descriptionTh: string;
  descriptionEn: string;
  attachments: AttachmentSummary[];
}

interface IndicatorFolder {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  visitMethod: string;
  collectionMethods: { id: string; name: string }[];
  dataSources: { id: string; name: string }[];
  evidenceItems: EvidenceItemSummary[];
}

interface StandardFolder {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  indicators: IndicatorFolder[];
}

// หน้าแฟ้มตรวจเยี่ยมสาธารณะ — สำหรับผู้ประเมิน สมศ. และบุคคลทั่วไป เข้าถึงได้โดยไม่ต้องล็อกอิน
// แสดงสถิติความพร้อมโดยรวม + เฉพาะหลักฐานที่ผ่านการตรวจสอบแล้วเท่านั้น (อ่านอย่างเดียว)
export function PublicFolderPage() {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  const summaryQuery = useQuery({
    queryKey: ["public", "summary"],
    queryFn: async () => (await apiClient.get<DashboardSummary>("/public/summary")).data,
  });
  const folderQuery = useQuery({
    queryKey: ["public", "folder"],
    queryFn: async () => (await apiClient.get<StandardFolder[]>("/public/folder")).data,
  });

  const summary = summaryQuery.data;
  const readinessPct =
    summary && summary.overall.total > 0 ? Math.round((summary.overall.approved / summary.overall.total) * 100) : 0;
  const readyCount = (summary?.byIndicator ?? []).filter((ind) => ind.pctComplete === 100).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        <h1 className="sr-only">{t("public.title")}</h1>
        <img src="/hero-banner.png" alt={t("public.title")} className="h-auto w-full object-cover" />
        <Link
          to="/login"
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
        >
          <LogIn className="h-3.5 w-3.5" />
          {t("auth.loginButton")}
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted">{t("public.subtitle")}</p>

      {(summaryQuery.isLoading || folderQuery.isLoading) && <DashboardSkeleton />}
      {(summaryQuery.isError || folderQuery.isError) && (
        <p className="mt-6 text-sm text-status-danger">{t("common.error")}</p>
      )}

      {summary && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              tone="primary"
              label={t("dashboard.overallReadiness")}
              value={`${readinessPct}%`}
              sub={`${summary.overall.approved}/${summary.overall.total} ${t("common.evidenceItems")}`}
            />
            <StatCard
              icon={CheckCircle2}
              tone="success"
              label={t("dashboard.readyIndicators")}
              value={`${readyCount}/${summary.byIndicator.length}`}
              sub={t("common.indicators")}
            />
            <StatCard
              icon={ClipboardList}
              tone="primary"
              value={folderQuery.data?.length ?? 3}
              label={t("public.standardsLabel")}
            />
            <StatCard
              icon={FileCheck2}
              tone="success"
              value={summary.overall.approved}
              label={t("public.totalDocuments")}
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card title={t("public.standardComparison")}>
              <StandardComparisonBars data={summary.byStandard} />
            </Card>
            <Card title={t("dashboard.statusOverall")}>
              <StatusDonutChart counts={summary.overall} />
            </Card>
          </div>

          <div className="mt-4">
            <Card title={t("dashboard.statusByStandard")}>
              <StandardProgressChart data={summary.byStandard} />
            </Card>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {t("public.indicatorOverview")}
            </h2>
            <IndicatorReadinessGrid data={summary.byIndicator} />
          </section>
        </>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("public.folderTitle")}</h2>
        <div className="space-y-6">
          {folderQuery.data?.map((standard) => (
            <section key={standard.id}>
              <h3 className="mb-3 font-semibold text-primary-700 dark:text-primary">
                {standard.code} — {isThai ? standard.nameTh : standard.nameEn}
              </h3>
              <div className="space-y-3">
                {standard.indicators.map((ind) => (
                  <div key={ind.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
                        {ind.code}
                      </span>
                      <h4 className="text-sm font-medium text-ink">{isThai ? ind.nameTh : ind.nameEn}</h4>
                      <span className="ml-auto text-xs text-muted">
                        {t("assessorFolder.visitMethod")}: {ind.visitMethod}
                      </span>
                    </div>
                    {ind.dataSources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                        <span>
                          {t("indicatorDetail.dataSources")}: {ind.dataSources.map((s) => s.name).join(", ")}
                        </span>
                      </div>
                    )}

                    {ind.evidenceItems.length === 0 ? (
                      <p className="mt-3 text-xs text-muted">{t("assessorFolder.empty")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {ind.evidenceItems.map((ev) => (
                          <li key={ev.id} className="rounded-lg bg-surface-alt p-3">
                            <p className="text-sm text-ink">{isThai ? ev.descriptionTh : ev.descriptionEn}</p>
                            <ul className="mt-2 space-y-1">
                              {ev.attachments.map((att) => (
                                <li key={att.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <AttachmentIcon type={att.type} />
                                    <span className="truncate">{att.filename}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openPublicAttachment(att.id)}
                                    className="shrink-0 text-primary-700 underline dark:text-primary"
                                  >
                                    {t("indicatorDetail.open")}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
