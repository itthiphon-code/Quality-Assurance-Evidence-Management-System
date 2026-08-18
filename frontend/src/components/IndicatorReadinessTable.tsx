import { useTranslation } from "react-i18next";

export interface IndicatorReadiness {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  standardCode: string;
  total: number;
  approved: number;
  pctComplete: number;
  hasRevise: boolean;
}

export function IndicatorReadinessTable({ data }: { data: IndicatorReadiness[] }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-2">{t("readinessTable.code")}</th>
            <th className="px-3 py-2">{t("readinessTable.name")}</th>
            <th className="w-40 px-3 py-2">{t("readinessTable.progress")}</th>
            <th className="px-3 py-2 text-right">{t("common.evidenceItems")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ind) => (
            <tr key={ind.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-xs font-medium text-muted">
                {ind.standardCode} · {ind.code}
              </td>
              <td className="px-3 py-2">
                <span>{isThai ? ind.nameTh : ind.nameEn}</span>
                {ind.hasRevise && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-status-danger">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t("readinessTable.needsRevision")}
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div className="h-full rounded-full bg-status-success" style={{ width: `${ind.pctComplete}%` }} />
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs text-muted">{ind.pctComplete}%</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right text-xs text-muted">
                {ind.approved}/{ind.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
