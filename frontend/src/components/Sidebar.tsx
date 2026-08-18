import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import type { UserRole } from "../features/auth/authContext";

interface NavItem {
  labelKey: string;
  to?: string; // ไม่มี to = เมนูที่ยังไม่เปิดใช้งานในเฟสนี้ (แสดงแบบจาง กดไม่ได้)
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  teacher: [{ labelKey: "nav.myWork", to: "/" }],
  qa: [
    { labelKey: "nav.dashboard", to: "/" },
    { labelKey: "nav.reviewQueue", to: "/review-queue" },
    { labelKey: "management.indicators", to: "/management/indicators" },
    { labelKey: "management.users", to: "/management/users" },
  ],
  assessor: [{ labelKey: "nav.assessorFolder", to: "/" }],
  exec: [{ labelKey: "nav.dashboard", to: "/" }],
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "block rounded-md bg-primary-tint px-3 py-2 text-sm font-medium text-primary-700 dark:bg-surface-alt dark:text-primary"
    : "block rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-alt";

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-surface p-3 md:block">
      <ul className="space-y-1">
        {items.map((item) =>
          item.to ? (
            <li key={item.labelKey}>
              <NavLink to={item.to} end={item.to === "/"} className={linkClass}>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ) : (
            <li key={item.labelKey}>
              <div aria-disabled className="cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted opacity-60">
                {t(item.labelKey)}
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
