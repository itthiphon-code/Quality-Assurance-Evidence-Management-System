import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { NAV_BY_ROLE } from "./navConfig";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

// เมนูนำทางสำหรับจอเล็ก (มือถือ) — Sidebar หลักซ่อนอยู่ที่ `hidden md:block`
// จึงต้องมีทางเข้าถึงเมนูเดียวกันบนมือถือ ไม่เช่นนั้นผู้ใช้จะไปหน้าอื่นนอกจากหน้าแรกไม่ได้เลย
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!open || !user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    // เริ่มที่ top-16 (ใต้ Header ทั้งชิ้น) เสมอ — ไม่ใช้ inset-0 ทับทั้งจอ เพื่อไม่ให้พื้นหลังคลิกปิด
    // มาบังปุ่ม/ตัวควบคุมใน Header (ปุ่มเปิด-ปิดเมนูเอง, สลับภาษา, สลับธีม ฯลฯ) จนกดไม่ได้
    <div className="fixed inset-x-0 bottom-0 top-16 z-10 md:hidden">
      <button type="button" aria-hidden="true" tabIndex={-1} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <nav className="relative border-b border-border bg-surface p-3 shadow-lg">
        <ul className="space-y-1">
          {items.map((item) =>
            item.to ? (
              <li key={item.labelKey}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive
                      ? "block rounded-md bg-primary-tint px-3 py-2 text-sm font-medium text-primary-700 dark:bg-surface-alt dark:text-primary"
                      : "block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-alt"
                  }
                >
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
    </div>
  );
}
