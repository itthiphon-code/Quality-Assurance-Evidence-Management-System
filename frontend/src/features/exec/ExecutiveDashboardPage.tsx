import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Clock3, Target } from "lucide-react";
import { useAuth } from "../../features/auth/authContext";
import { useDashboardSummary } from "../../lib/useDashboardSummary";
import { StatusDonutChart } from "../../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../../components/IndicatorReadinessTable";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";

export function ExecutiveDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isThai = i18n.language?.startsWith("th");

  const { data, isLoading, isError } = useDashboardSummary();

  const readinessPct = data && data.overall.total > 0 ? Math.round((data.overall.approved / data.overall.total) * 100) : 0;
  const riskItems = (data?.byIndicator ?? []).filter((ind) => ind.hasRevise || ind.approved === 0);
  const readyCount = (data?.byIndicator ?? []).filter((ind) => ind.pctComplete === 100).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">
          {t("common.welcome")}, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-white/80">{t("dashboard.execWelcome")}</p>
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-6 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              tone="primary"
              label={t("dashboard.overallReadiness")}
              value={`${readinessPct}%`}
              sub={`${data.overall.approved}/${data.overall.total} ${t("common.evidenceItems")}`}
            />
            <StatCard
              icon={CheckCircle2}
              tone="success"
              label={t("dashboard.readyIndicators")}
              value={`${readyCount}/${data.byIndicator.length}`}
              sub={t("common.indicators")}
            />
            <StatCard icon={Clock3} tone="pending" label={t("status.review")} value={data.overall.review} />
            <StatCard icon={AlertTriangle} tone="danger" label={t("dashboard.riskList")} value={riskItems.length} />
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-status-danger">{t("dashboard.riskList")}</h2>
            {riskItems.length === 0 ? (
              <p className="text-sm text-muted">{t("dashboard.noRisk")}</p>
            ) : (
              <ul className="space-y-2">
                {riskItems.map((ind) => (
                  <li
                    key={ind.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-l-4 border-status-danger bg-surface px-4 py-3 text-sm shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
                        {ind.standardCode} · {ind.code}
                      </span>
                      {isThai ? ind.nameTh : ind.nameEn}
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
            <Card title={t("dashboard.statusByStandard")}>
              <StandardProgressChart data={data.byStandard} />
            </Card>
            <Card title={t("dashboard.statusOverall")}>
              <StatusDonutChart counts={data.overall} />
            </Card>
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
