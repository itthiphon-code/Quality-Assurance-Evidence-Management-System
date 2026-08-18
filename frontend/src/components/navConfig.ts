import { ClipboardCheck, LayoutDashboard, ListChecks, UserCircle, Users, type LucideIcon } from "lucide-react";
import type { UserRole } from "../features/auth/authContext";

export interface NavItem {
  labelKey: string;
  icon: LucideIcon;
  to?: string; // ไม่มี to = เมนูที่ยังไม่เปิดใช้งานในเฟสนี้ (แสดงแบบจาง กดไม่ได้)
}

// รายการเมนูตามบทบาท — ใช้ร่วมกันระหว่าง Sidebar (จอกว้าง) และ MobileNav (จอเล็ก)
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  teacher: [
    { labelKey: "nav.myWork", icon: ClipboardCheck, to: "/" },
    { labelKey: "nav.account", icon: UserCircle, to: "/account" },
  ],
  qa: [
    { labelKey: "nav.dashboard", icon: LayoutDashboard, to: "/" },
    { labelKey: "nav.reviewQueue", icon: ClipboardCheck, to: "/review-queue" },
    { labelKey: "management.indicators", icon: ListChecks, to: "/management/indicators" },
    { labelKey: "management.users", icon: Users, to: "/management/users" },
    { labelKey: "nav.account", icon: UserCircle, to: "/account" },
  ],
  exec: [
    { labelKey: "nav.dashboard", icon: LayoutDashboard, to: "/" },
    { labelKey: "nav.account", icon: UserCircle, to: "/account" },
  ],
};
