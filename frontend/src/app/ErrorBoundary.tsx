import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

// ส่วนแสดงผลแยกเป็นฟังก์ชันคอมโพเนนต์ เพราะ error boundary ต้องเป็น class component
// (React รองรับ componentDidCatch เฉพาะ class) ซึ่งใช้ hook อย่าง useTranslation ไม่ได้
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-10 text-ink">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-status-danger/10 text-status-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{t("error.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("error.message")}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-tint transition-colors hover:bg-primary-700"
          >
            <RotateCcw className="h-4 w-4" />
            {t("error.reload")}
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
          >
            <Home className="h-4 w-4" />
            {t("error.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// ดักข้อผิดพลาดตอน render ของ React ไม่ให้ทั้งหน้ากลายเป็นจอขาวโดยไม่บอกอะไรผู้ใช้
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // ยังไม่มีบริการรวบรวม error ฝั่ง production — log ไว้ที่ console ให้เปิดดูได้จาก DevTools ก่อน
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // โหลดหน้าใหม่ทั้งหน้าแทนการแค่ล้าง state เพราะ state ที่พังอาจอยู่นอก boundary นี้
      return <ErrorFallback onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
