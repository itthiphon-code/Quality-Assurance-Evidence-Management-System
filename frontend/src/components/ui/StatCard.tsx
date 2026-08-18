import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type StatTone = "primary" | "pending" | "warning" | "danger" | "success";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: string;
  tone: StatTone;
  onClick?: () => void;
}

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  pending: "bg-status-pending/10 text-status-pending",
  warning: "bg-status-warning/10 text-status-warning",
  danger: "bg-status-danger/10 text-status-danger",
  success: "bg-status-success/10 text-status-success",
};

// การ์ดสรุปตัวเลข (KPI) — ใช้แถวบนสุดของแดชบอร์ด กดได้เมื่อมี onClick (เช่นลิงก์ไปคิวตรวจสอบ)
export function StatCard({ icon: Icon, label, value, sub, tone, onClick }: StatCardProps) {
  const classes = `flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-colors ${
    onClick ? "hover:border-primary/40 hover:bg-surface-alt" : ""
  }`;
  const content = (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">{label}</span>
        <span className="block text-2xl font-semibold tracking-tight text-ink">{value}</span>
        {sub && <span className="mt-0.5 block truncate text-xs text-muted">{sub}</span>}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
