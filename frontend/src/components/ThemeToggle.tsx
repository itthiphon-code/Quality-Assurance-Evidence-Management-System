import { useTranslation } from "react-i18next";
import { useTheme } from "../app/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      title={theme === "dark" ? t("theme.light") : t("theme.dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-base transition-colors hover:bg-surface-alt"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
