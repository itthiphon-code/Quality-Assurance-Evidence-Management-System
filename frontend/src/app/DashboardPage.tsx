import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../features/auth/authContext";
import { useDashboardSummary } from "../lib/useDashboardSummary";
import { StatusDonutChart } from "../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../components/IndicatorReadinessTable";

interface ReviewQueueItemDto {
  id: string;
}

// แดชบอร์ดของงานประกันคุณภาพ — ภาพรวมสถานะหลักฐานทั้งระบบ + คิวตรวจสอบ
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
      <h1 className="text-xl font-semibold text-ink">
        {t("common.welcome")}, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-muted">{t("dashboard.qaWelcome")}</p>

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
