import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

// หน้า 404 — เดิมเส้นทางที่ไม่รู้จักจะถูกเด้งกลับหน้าแรกเงียบ ๆ ทำให้ผู้ใช้สับสน
// ว่าลิงก์เสีย พิมพ์ผิด หรือไม่มีสิทธิ์เข้าถึงกันแน่
export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary-700 dark:bg-surface-alt dark:text-primary">
        <Compass className="h-7 w-7" />
      </div>
      <p className="mt-5 text-4xl font-bold tracking-tight text-primary-700 dark:text-primary">404</p>
      <h1 className="mt-2 text-lg font-semibold text-ink">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("notFound.message")}</p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-tint transition-colors hover:bg-primary-700"
      >
        <Home className="h-4 w-4" />
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
