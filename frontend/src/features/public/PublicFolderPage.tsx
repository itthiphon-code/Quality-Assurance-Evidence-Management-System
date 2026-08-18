import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { openPublicAttachment } from "../../lib/attachments";
import type { DashboardSummary } from "../../lib/useDashboardSummary";
import { StatusDonutChart } from "../../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../../components/IndicatorReadinessTable";

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{t("public.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("public.subtitle")}</p>
        </div>
        <Link
          to="/login"
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-tint dark:text-primary dark:hover:bg-surface-alt"
        >
          {t("auth.loginButton")}
        </Link>
      </div>

      {(summaryQuery.isLoading || folderQuery.isLoading) && (
        <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>
      )}
      {(summaryQuery.isError || folderQuery.isError) && (
        <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>
      )}

      {summary && (
        <>
          <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{t("dashboard.overallReadiness")}</span>
              <span className="text-2xl font-bold text-primary-700 dark:text-primary">{readinessPct}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
              <div className="h-full rounded-full bg-status-success" style={{ width: `${readinessPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {summary.overall.approved}/{summary.overall.total} {t("common.evidenceItems")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("dashboard.statusByStandard")}
              </h2>
              <StandardProgressChart data={summary.byStandard} />
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("dashboard.statusOverall")}
              </h2>
              <StatusDonutChart counts={summary.overall} />
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {t("dashboard.readinessTable")}
            </h2>
            <IndicatorReadinessTable data={summary.byIndicator} />
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
                  <div key={ind.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-sm font-medium text-ink">
                        {ind.code} — {isThai ? ind.nameTh : ind.nameEn}
                      </h4>
                      <span className="text-xs text-muted">
                        {t("assessorFolder.visitMethod")}: {ind.visitMethod}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                      {ind.collectionMethods.length > 0 && (
                        <span>
                          {t("indicatorDetail.collectionMethods")}: {ind.collectionMethods.map((m) => m.name).join(", ")}
                        </span>
                      )}
                      {ind.dataSources.length > 0 && (
                        <span>
                          {t("indicatorDetail.dataSources")}: {ind.dataSources.map((s) => s.name).join(", ")}
                        </span>
                      )}
                    </div>

                    {ind.evidenceItems.length === 0 ? (
                      <p className="mt-3 text-xs text-muted">{t("assessorFolder.empty")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {ind.evidenceItems.map((ev) => (
                          <li key={ev.id} className="rounded-lg bg-surface-alt p-3">
                            <p className="text-sm text-ink">{isThai ? ev.descriptionTh : ev.descriptionEn}</p>
                            <ul className="mt-2 space-y-1">
                              {ev.attachments.map((att) => (
                                <li key={att.id} className="flex items-center justify-between text-xs">
                                  <span className="truncate">
                                    {att.type === "drive_link" ? "🔗" : "📄"} {att.filename}
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
