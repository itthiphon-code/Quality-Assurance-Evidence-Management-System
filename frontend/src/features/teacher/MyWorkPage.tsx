import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { StatusBadge } from "../../components/StatusBadge";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">{t("myWork.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("myWork.subtitle")}</p>

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-status-danger">{t("myWork.needsRevision")}</h2>
            {reviseItems.length === 0 ? (
              <p className="text-sm text-muted">{t("myWork.noNeedsRevision")}</p>
            ) : (
              <ul className="space-y-2">
                {reviseItems.map(({ indicator, evidence }) => (
                  <li key={evidence.id}>
                    <button
                      type="button"
                      onClick={() => openIndicator(indicator.id)}
                      className="flex w-full items-center justify-between rounded-lg border-l-4 border-status-danger bg-surface px-3 py-2 text-left text-sm shadow-sm hover:bg-surface-alt"
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

          <section className="mt-8">
            {data.length === 0 ? (
              <p className="text-sm text-muted">{t("myWork.noAssignments")}</p>
            ) : (
              <ul className="space-y-3">
                {data.map((ind) => {
                  const total = ind.evidenceItems.length;
                  const approved = ind.evidenceItems.filter((e) => e.status === "approved").length;
                  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
                  return (
                    <li key={ind.id}>
                      <button
                        type="button"
                        onClick={() => openIndicator(ind.id)}
                        className="block w-full rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-alt"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted">
                            {ind.standard.code} · {ind.code}
                          </span>
                          <span className="text-xs text-muted">
                            {approved}/{total} {t("common.evidenceItems")}
                          </span>
                        </div>
                        <h3 className="mt-1 font-medium text-ink">{isThai ? ind.nameTh : ind.nameEn}</h3>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
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
