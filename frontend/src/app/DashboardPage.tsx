import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { downloadFile } from "../lib/downloadFile";
import { useAuth } from "../features/auth/authContext";
import { useDashboardSummary } from "../lib/useDashboardSummary";
import { StatusDonutChart } from "../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../components/IndicatorReadinessTable";

interface ReviewQueueItemDto {
  id: string;
}

function ReportExportButtons() {
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const exportPdf = useMutation({
    mutationFn: () => downloadFile("/reports/summary.pdf", "qaems-summary.pdf"),
    onError: () => setError(true),
    onSuccess: () => setError(false),
  });
  const exportExcel = useMutation({
    mutationFn: () => downloadFile("/reports/summary.xlsx", "qaems-summary.xlsx"),
    onError: () => setError(true),
    onSuccess: () => setError(false),
  });

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={exportPdf.isPending}
        onClick={() => exportPdf.mutate()}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-alt disabled:opacity-50"
      >
        {exportPdf.isPending ? t("reports.exporting") : t("reports.exportPdf")}
      </button>
      <button
        type="button"
        disabled={exportExcel.isPending}
        onClick={() => exportExcel.mutate()}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-alt disabled:opacity-50"
      >
        {exportExcel.isPending ? t("reports.exporting") : t("reports.exportExcel")}
      </button>
      {error && <span className="text-xs text-status-danger">{t("reports.exportError")}</span>}
    </div>
  );
}

// แดชบอร์ดของงานประกันคุณภาพ — ภาพรวมสถานะหลักฐานทั้งระบบ + คิวตรวจสอบ + ส่งออกรายงาน
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: reviewQueue } = useQuery({
    queryKey: ["evidence", "review-queue"],
    queryFn: async () => (await apiClient.get<ReviewQueueItemDto[]>("/evidence/review-queue")).data,
  });

  const { data, isLoading, isError } = useDashboardSummary();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {t("common.welcome")}, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("dashboard.qaWelcome")}</p>
        </div>
        <ReportExportButtons />
      </div>

      <Link
        to="/review-queue"
        className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-alt"
      >
        <span className="text-sm font-medium text-ink">{t("dashboard.pendingReview")}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-sm font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
            {reviewQueue?.length ?? 0}
          </span>
          <span className="text-sm text-primary-700 underline dark:text-primary">{t("dashboard.goToReviewQueue")}</span>
        </span>
      </Link>

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("dashboard.statusByStandard")}
              </h2>
              <StandardProgressChart data={data.byStandard} />
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("dashboard.statusOverall")}
              </h2>
              <StatusDonutChart counts={data.overall} />
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {t("dashboard.readinessTable")}
            </h2>
            <IndicatorReadinessTable data={data.byIndicator} />
          </section>
        </>
      )}
    </div>
  );
}
