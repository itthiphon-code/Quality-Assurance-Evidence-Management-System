import { useTranslation } from "react-i18next";

export function LangToggle() {
  const { i18n, t } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isThai ? "en" : "th")}
      aria-label={t("language.toggle")}
      title={t("language.toggle")}
      className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-medium transition-colors hover:bg-surface-alt"
    >
      <span className={isThai ? "text-primary" : "text-muted"}>TH</span>
      <span className="text-muted">/</span>
      <span className={!isThai ? "text-primary" : "text-muted"}>EN</span>
    </button>
  );
}
