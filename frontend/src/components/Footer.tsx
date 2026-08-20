import { useTranslation } from "react-i18next";
import { APP_VERSION, AUTHOR, COPYRIGHT_YEAR } from "../lib/appInfo";

// เครดิตผู้พัฒนา — แสดงท้ายทุกหน้า
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border px-4 py-5 text-center sm:px-6">
      <p className="text-xs leading-relaxed text-muted">
        © {COPYRIGHT_YEAR} {AUTHOR}. {t("footer.affiliation")} {t("footer.rights")}
        {" · "}
        {t("footer.version", { version: APP_VERSION })}
      </p>
    </footer>
  );
}
