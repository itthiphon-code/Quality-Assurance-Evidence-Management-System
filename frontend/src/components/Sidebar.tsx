import { useTranslation } from "react-i18next";
import { useAuth } from "../features/auth/authContext";
import type { UserRole } from "../features/auth/authContext";

interface NavItem {
  labelKey: string;
  active: boolean; // เมนูที่ยังไม่เปิดใช้งานในเฟสนี้จะแสดงแบบจางและกดไม่ได้
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  teacher: [
    { labelKey: "nav.dashboard", active: true },
    { labelKey: "nav.myWork", active: false },
  ],
  qa: [
    { labelKey: "nav.dashboard", active: true },
    { labelKey: "nav.reviewQueue", active: false },
    { labelKey: "nav.management", active: false },
  ],
  assessor: [
    { labelKey: "nav.dashboard", active: true },
    { labelKey: "nav.assessorFolder", active: false },
  ],
  exec: [{ labelKey: "nav.dashboard", active: true }],
};

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-surface p-3 md:block">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.labelKey}>
            <div
              aria-disabled={!item.active}
              className={
                item.active
                  ? "rounded-md bg-primary-tint px-3 py-2 text-sm font-medium text-primary-700 dark:text-primary"
                  : "cursor-not-allowed rounded-md px-3 py-2 text-sm text-muted opacity-60"
              }
            >
              {t(item.labelKey)}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
