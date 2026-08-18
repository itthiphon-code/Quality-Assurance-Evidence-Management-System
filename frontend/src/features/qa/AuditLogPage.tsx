import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { ListSkeleton } from "../../components/ui/Skeleton";

interface AuditLogDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface AuditLogPage {
  items: AuditLogDto[];
  total: number;
  page: number;
  pageSize: number;
}

interface ActionCount {
  action: string;
  count: number;
}

// สีป้ายตามลักษณะการกระทำ ให้กวาดสายตาหาเหตุการณ์สำคัญ (อนุมัติ/ลบ/เปลี่ยนสถานะ) ได้เร็ว
function actionToneClass(action: string): string {
  if (["approve", "create_user", "upload", "submit"].includes(action)) {
    return "bg-status-success/10 text-status-success";
  }
  if (["revise", "delete_attachment", "reset_password", "status_override"].includes(action)) {
    return "bg-status-danger/10 text-status-danger";
  }
  if (["login", "view", "export"].includes(action)) return "bg-status-pending/10 text-status-pending";
  return "bg-surface-alt text-ink";
}

export function AuditLogPage() {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const { data: actions } = useQuery({
    queryKey: ["audit-logs", "actions"],
    queryFn: async () => (await apiClient.get<ActionCount[]>("/audit-logs/actions")).data,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs", action, page],
    queryFn: async () =>
      (await apiClient.get<AuditLogPage>("/audit-logs", { params: { action: action || undefined, page } })).data,
    // คงข้อมูลหน้าเดิมไว้ระหว่างโหลดหน้าถัดไป ตารางจะไม่กะพริบเป็นช่องว่างตอนกดเปลี่ยนหน้า
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">{t("audit.title")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("audit.subtitle")}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          {t("audit.filterAction")}
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-base px-3 py-1.5 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">{t("audit.allActions")}</option>
            {actions?.map((a) => (
              <option key={a.action} value={a.action}>
                {t(`audit.action.${a.action}`, a.action)} ({a.count})
              </option>
            ))}
          </select>
        </label>
        {data && <span className="text-sm text-muted">{t("audit.totalRecords", { n: data.total })}</span>}
      </div>

      {isLoading && <ListSkeleton rows={6} />}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2.5">{t("audit.time")}</th>
                  <th className="px-4 py-2.5">{t("audit.user")}</th>
                  <th className="px-4 py-2.5">{t("audit.actionLabel")}</th>
                  <th className="px-4 py-2.5">{t("audit.entity")}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="border-b border-border transition-colors last:border-0 hover:bg-surface-alt">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted">
                      {new Date(log.createdAt).toLocaleString(isThai ? "th-TH" : "en-GB")}
                    </td>
                    <td className="px-4 py-2.5">
                      {log.user ? (
                        <span className="text-ink">{log.user.name}</span>
                      ) : (
                        // userId เป็น null = เปิดดูผ่านหน้าแฟ้มสาธารณะโดยไม่ล็อกอิน (ผู้ประเมิน สมศ.)
                        <span className="text-muted">{t("audit.publicVisitor")}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${actionToneClass(log.action)}`}
                      >
                        {t(`audit.action.${log.action}`, log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{log.entityType}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                      {t("audit.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-alt disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("audit.prev")}
              </button>
              <span className="text-sm text-muted">{t("audit.pageOf", { page, total: totalPages })}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-alt disabled:opacity-40"
              >
                {t("audit.next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
