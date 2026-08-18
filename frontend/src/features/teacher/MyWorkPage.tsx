import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ClipboardList, Target } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../auth/authContext";
import { StatCard } from "../../components/ui/StatCard";
import { ListSkeleton } from "../../components/ui/Skeleton";

interface EvidenceSummary {
  id: string;
  status: string;
}

interface IndicatorListItem {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  standard: { id: string; code: string; nameTh: string; nameEn: string };
  evidenceItems: EvidenceSummary[];
}

export function MyWorkPage() {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // เปิดรายละเอียดตัวชี้วัดเป็นแผงเลื่อน (Drawer) แทนการออกจากหน้านี้ — ส่ง state.backgroundLocation
  // ไปด้วยเพื่อให้ App.tsx คง "หน้างานของฉัน" นี้ไว้เป็นพื้นหลัง (ดูคอมเมนต์ที่ App.tsx)
  const openIndicator = (id: string) => navigate(`/indicators/${id}`, { state: { backgroundLocation: location } });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["indicators", "mine"],
    queryFn: async () => (await apiClient.get<IndicatorListItem[]>("/indicators?mine=true")).data,
  });

  const reviseItems = (data ?? []).flatMap((ind) =>
    ind.evidenceItems.filter((e) => e.status === "revise").map((e) => ({ indicator: ind, evidence: e })),
  );

  const totalEvidence = (data ?? []).reduce((sum, ind) => sum + ind.evidenceItems.length, 0);
  const approvedEvidence = (data ?? []).reduce(
    (sum, ind) => sum + ind.evidenceItems.filter((e) => e.status === "approved").length,
    0,
  );
  const overallPct = totalEvidence > 0 ? Math.round((approvedEvidence / totalEvidence) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">
          {t("common.welcome")}, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-white/80">{t("myWork.subtitle")}</p>
      </div>

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <p className="mt-6 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard icon={ClipboardList} tone="primary" label={t("common.indicators")} value={data.length} />
            <StatCard
              icon={Target}
              tone="success"
              label={t("dashboard.overallReadiness")}
              value={`${overallPct}%`}
              sub={`${approvedEvidence}/${totalEvidence} ${t("common.evidenceItems")}`}
            />
            <StatCard icon={AlertTriangle} tone="danger" label={t("myWork.needsRevision")} value={reviseItems.length} />
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-status-danger">{t("myWork.needsRevision")}</h2>
            {reviseItems.length === 0 ? (
              <p className="text-sm text-muted">{t("myWork.noNeedsRevision")}</p>
            ) : (
              <ul className="space-y-2">
                {reviseItems.map(({ indicator, evidence }) => (
                  <li key={evidence.id}>
                    <button
                      type="button"
                      onClick={() => openIndicator(indicator.id)}
                      className="flex w-full items-center justify-between rounded-xl border-l-4 border-status-danger bg-surface px-4 py-3 text-left text-sm shadow-sm transition-colors hover:bg-surface-alt"
                    >
                      <span>
                        {indicator.code} — {isThai ? indicator.nameTh : indicator.nameEn}
                      </span>
                      <StatusBadge status={evidence.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("common.indicators")}</h2>
            {data.length === 0 ? (
              <p className="text-sm text-muted">{t("myWork.noAssignments")}</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.map((ind) => {
                  const total = ind.evidenceItems.length;
                  const approved = ind.evidenceItems.filter((e) => e.status === "approved").length;
                  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
                  return (
                    <li key={ind.id}>
                      <button
                        type="button"
                        onClick={() => openIndicator(ind.id)}
                        className="block w-full rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-alt"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
                            {ind.standard.code} · {ind.code}
                          </span>
                          <span className="text-xs text-muted">
                            {approved}/{total} {t("common.evidenceItems")}
                          </span>
                        </div>
                        <h3 className="mt-2 font-medium text-ink">{isThai ? ind.nameTh : ind.nameEn}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs font-medium text-muted">{pct}%</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
