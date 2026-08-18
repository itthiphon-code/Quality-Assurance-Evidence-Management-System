import { useTranslation } from "react-i18next";
import { useAuth } from "../../features/auth/authContext";
import { useDashboardSummary } from "../../lib/useDashboardSummary";
import { StatusDonutChart } from "../../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../../components/IndicatorReadinessTable";

export function ExecutiveDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isThai = i18n.language?.startsWith("th");

  const { data, isLoading, isError } = useDashboardSummary();

  const readinessPct = data && data.overall.total > 0 ? Math.round((data.overall.approved / data.overall.total) * 100) : 0;
  const riskItems = (data?.byIndicator ?? []).filter((ind) => ind.hasRevise || ind.approved === 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">
        {t("common.welcome")}, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-muted">{t("dashboard.execWelcome")}</p>

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
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
              {data.overall.approved}/{data.overall.total} {t("common.evidenceItems")}
            </p>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-status-danger">
              {t("dashboard.riskList")}
            </h2>
            {riskItems.length === 0 ? (
              <p className="text-sm text-muted">{t("dashboard.noRisk")}</p>
            ) : (
              <ul className="space-y-2">
                {riskItems.map((ind) => (
                  <li
                    key={ind.id}
                    className="flex items-center justify-between rounded-lg border-l-4 border-status-danger bg-surface px-3 py-2 text-sm shadow-sm"
                  >
                    <span>
                      {ind.standardCode} · {ind.code} — {isThai ? ind.nameTh : ind.nameEn}
                    </span>
                    <span className="text-xs text-muted">
                      {ind.hasRevise ? t("dashboard.riskReasonRevise") : t("dashboard.riskReasonNoProgress")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
