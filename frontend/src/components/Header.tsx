import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../features/auth/authContext";
import { LangToggle } from "./LangToggle";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        {user && (
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label={mobileNavOpen ? t("common.closeMenu") : t("common.menu")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-lg md:hidden"
          >
            {mobileNavOpen ? "✕" : "☰"}
          </button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-tint">
          QA
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink">{t("app.fullTitle")}</div>
          <div className="text-xs text-muted">{t("app.orgName")}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LangToggle />
        <ThemeToggle />
        <NotificationBell />
        {user && (
          <div className="ml-1 flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted">{t(`role.${user.role}`)}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-tint dark:hover:bg-surface-alt"
            >
              {t("common.logout")}
            </button>
          </div>
        )}
      </div>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}
