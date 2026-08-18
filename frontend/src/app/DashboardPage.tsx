import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../features/auth/authContext";

interface IndicatorDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  visitMethod: string;
  _count: { evidenceItems: number };
}

interface StandardDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  indicators: IndicatorDto[];
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isThai = i18n.language?.startsWith("th");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["standards"],
    queryFn: async () => (await apiClient.get<StandardDto[]>("/standards")).data,
  });

  const welcomeKey = user ? (`dashboard.${user.role}Welcome` as const) : "dashboard.teacherWelcome";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">
        {t("common.welcome")}, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-muted">{t(welcomeKey)}</p>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("dashboard.standardsOverview")}
        </h2>

        {isLoading && <p className="text-sm text-muted">{t("common.loading")}</p>}
        {isError && <p className="text-sm text-status-danger">{t("common.error")}</p>}

        <div className="space-y-4">
          {data?.map((standard) => (
            <div key={standard.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="font-semibold text-primary-700 dark:text-primary">
                {standard.code} — {isThai ? standard.nameTh : standard.nameEn}
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {standard.indicators.map((ind) => (
                  <li
                    key={ind.id}
                    className="flex items-center justify-between rounded-lg bg-surface-alt px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium">{ind.code}</span>{" "}
                      {isThai ? ind.nameTh : ind.nameEn}
                    </span>
                    <span className="rounded-full bg-primary-tint px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-surface dark:text-primary">
                      {ind._count.evidenceItems} {t("common.evidenceItems")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
