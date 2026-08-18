import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Clock3, FileDown, FileSpreadsheet, Loader2, Target } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { downloadFile } from "../lib/downloadFile";
import { useAuth } from "../features/auth/authContext";
import { useDashboardSummary } from "../lib/useDashboardSummary";
import { StatusDonutChart } from "../components/charts/StatusDonutChart";
import { StandardProgressChart } from "../components/charts/StandardProgressChart";
import { IndicatorReadinessTable } from "../components/IndicatorReadinessTable";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";

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
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={exportPdf.isPending}
        onClick={() => exportPdf.mutate()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        <FileDown className="h-3.5 w-3.5" />
        {exportPdf.isPending ? t("reports.exporting") : t("reports.exportPdf")}
      </button>
      <button
        type="button"
        disabled={exportExcel.isPending}
        onClick={() => exportExcel.mutate()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        {exportExcel.isPending ? t("reports.exporting") : t("reports.exportExcel")}
      </button>
      {error && <span className="text-xs text-red-200">{t("reports.exportError")}</span>}
    </div>
  );
}

// แดชบอร์ดของงานประกันคุณภาพ — ภาพรวมสถานะหลักฐานทั้งระบบ + คิวตรวจสอบ + ส่งออกรายงาน
export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // เปิดรายละเอียดตัวชี้วัดจากตารางความพร้อมเป็นแผงเลื่อน โดยคง Dashboard นี้ไว้เป็นพื้นหลัง
  // (ดูคอมเมนต์ที่ App.tsx) — ใช้ได้เฉพาะ qa เพราะ backend ปฏิเสธ exec ที่ endpoint นี้
  const openIndicator = (id: string) => navigate(`/indicators/${id}`, { state: { backgroundLocation: location } });

  const { data: reviewQueue } = useQuery({
    queryKey: ["evidence", "review-queue"],
    queryFn: async () => (await apiClient.get<ReviewQueueItemDto[]>("/evidence/review-queue")).data,
  });

  const { data, isLoading, isError } = useDashboardSummary();
  const pendingCount = reviewQueue?.length ?? 0;
  const overallPct = data && data.overall.total > 0 ? Math.round((data.overall.approved / data.overall.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {t("common.welcome")}, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-white/80">{t("dashboard.qaWelcome")}</p>
          </div>
          <ReportExportButtons />
        </div>
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
              value={`${overallPct}%`}
              sub={`${data.overall.approved}/${data.overall.total} ${t("common.evidenceItems")}`}
            />
            <StatCard
              icon={Clock3}
              tone="pending"
              label={t("dashboard.pendingReview")}
              value={pendingCount}
              sub={t("dashboard.goToReviewQueue")}
              onClick={() => navigate("/review-queue")}
            />
            <StatCard
              icon={Loader2}
              tone="warning"
              label={t("dashboard.inProgress")}
              value={data.overall.todo + data.overall.progress}
              sub={t("dashboard.inProgressSub")}
            />
            <StatCard
              icon={AlertTriangle}
              tone="danger"
              label={t("status.revise")}
              value={data.overall.revise}
              sub={t("dashboard.reviseSub")}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
            <IndicatorReadinessTable data={data.byIndicator} onRowClick={openIndicator} />
          </section>
        </>
      )}
    </div>
  );
}
