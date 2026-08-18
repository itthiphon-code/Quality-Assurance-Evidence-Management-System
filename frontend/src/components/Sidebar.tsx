import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { NAV_BY_ROLE } from "./navConfig";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-primary-tint font-medium text-primary-700 dark:bg-surface-alt dark:text-primary"
      : "text-ink hover:bg-surface-alt"
  }`;

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <nav className="hidden w-60 shrink-0 border-r border-border bg-surface p-3 md:block">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return item.to ? (
            <li key={item.labelKey}>
              <NavLink to={item.to} end={item.to === "/"} className={linkClass}>
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.labelKey)}
              </NavLink>
            </li>
          ) : (
            <li key={item.labelKey}>
              <div
                aria-disabled
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted opacity-60"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.labelKey)}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
