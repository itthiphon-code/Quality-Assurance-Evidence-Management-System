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

// สีแถบความคืบหน้าไล่ระดับตามเกณฑ์ % ให้เห็นความเสี่ยงแบบเดาสายตาได้ทันที
// (เขียว = พร้อมแล้ว, ทอง = ใกล้เสร็จ, ส้ม/เหลือง = ปานกลาง, แดง = ยังตามหลังมาก)
function progressColorClass(pct: number): string {
  if (pct >= 100) return "bg-status-success";
  if (pct >= 60) return "bg-accent-gold";
  if (pct >= 40) return "bg-status-warning";
  return "bg-status-danger";
}

interface IndicatorReadinessTableProps {
  data: IndicatorReadiness[];
  // เปิดได้เฉพาะจากหน้าที่ backend อนุญาตให้ดูรายละเอียดตัวชี้วัด (qa) — ไม่ส่ง prop นี้จาก
  // exec/สาธารณะ เพราะ GET /api/indicators/:id ปฏิเสธสองบทบาทนั้น (403) ตาราง/แถวจึงต้องไม่กดได้
  onRowClick?: (id: string) => void;
}

export function IndicatorReadinessTable({ data, onRowClick }: IndicatorReadinessTableProps) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-2.5">{t("readinessTable.code")}</th>
            <th className="px-4 py-2.5">{t("readinessTable.name")}</th>
            <th className="w-40 px-4 py-2.5">{t("readinessTable.progress")}</th>
            <th className="px-4 py-2.5 text-right">{t("common.evidenceItems")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ind) => (
            <tr
              key={ind.id}
              onClick={onRowClick ? () => onRowClick(ind.id) : undefined}
              className={`border-b border-border transition-colors last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-surface-alt" : ""
              }`}
            >
              <td className="px-4 py-2.5">
                <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
                  {ind.standardCode} · {ind.code}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <span>{isThai ? ind.nameTh : ind.nameEn}</span>
                {ind.hasRevise && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-status-danger/10 px-2 py-0.5 text-[11px] font-medium text-status-danger">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t("readinessTable.needsRevision")}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div
                      className={`h-full rounded-full ${progressColorClass(ind.pctComplete)}`}
                      style={{ width: `${ind.pctComplete}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs font-medium text-muted">{ind.pctComplete}%</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted">
                {ind.approved}/{ind.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
