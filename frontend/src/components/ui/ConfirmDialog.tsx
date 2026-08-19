import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

// กล่องยืนยันของระบบเอง — ใช้แทน window.confirm() ซึ่งเป็นหน้าต่างของเบราว์เซอร์
// ที่จัดสไตล์ไม่ได้ ไม่รองรับธีมมืด และหน้าตาต่างกันในแต่ละเบราว์เซอร์
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // กล่องนี้มักเปิดซ้อนอยู่บนแผงเลื่อน (IndicatorDrawer) ซึ่งดัก Escape ที่ window เหมือนกัน
      // ถ้าไม่หยุดการส่งต่อ กด Escape ครั้งเดียวจะปิดทั้งกล่องยืนยันและแผงเลื่อนพร้อมกัน
      // จับในช่วง capture เพื่อให้ทำงานก่อน listener ของแผงเลื่อนที่อยู่ช่วง bubble
      e.stopPropagation();
      onCancel();
    };
    window.addEventListener("keydown", onKeyDown, true);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = original;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[1px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg"
      >
        <div className="flex gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              tone === "danger" ? "bg-status-danger/10 text-status-danger" : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-muted">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-alt"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
              tone === "danger" ? "bg-status-danger hover:opacity-90" : "bg-primary hover:bg-primary-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
