import { useTranslation } from "react-i18next";

const STATUS_TEXT_COLOR: Record<string, string> = {
  todo: "text-muted",
  progress: "text-status-pending",
  review: "text-accent-gold",
  approved: "text-status-success",
  revise: "text-status-danger",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-2.5 py-0.5 text-xs font-medium ${
        STATUS_TEXT_COLOR[status] ?? "text-ink"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(`status.${status}`)}
    </span>
  );
}
