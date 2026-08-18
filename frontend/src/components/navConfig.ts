import type { UserRole } from "../features/auth/authContext";

export interface NavItem {
  labelKey: string;
  to?: string; // ไม่มี to = เมนูที่ยังไม่เปิดใช้งานในเฟสนี้ (แสดงแบบจาง กดไม่ได้)
}

// รายการเมนูตามบทบาท — ใช้ร่วมกันระหว่าง Sidebar (จอกว้าง) และ MobileNav (จอเล็ก)
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  teacher: [
    { labelKey: "nav.myWork", to: "/" },
    { labelKey: "nav.account", to: "/account" },
  ],
  qa: [
    { labelKey: "nav.dashboard", to: "/" },
    { labelKey: "nav.reviewQueue", to: "/review-queue" },
    { labelKey: "management.indicators", to: "/management/indicators" },
    { labelKey: "management.users", to: "/management/users" },
    { labelKey: "nav.account", to: "/account" },
  ],
  exec: [
    { labelKey: "nav.dashboard", to: "/" },
    { labelKey: "nav.account", to: "/account" },
  ],
};
