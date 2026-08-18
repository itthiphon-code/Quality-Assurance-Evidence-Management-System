import { useAuth } from "../features/auth/authContext";
import { ExecutiveDashboardPage } from "../features/exec/ExecutiveDashboardPage";
import { MyWorkPage } from "../features/teacher/MyWorkPage";
import { DashboardPage } from "./DashboardPage";

// หน้าแรกของผู้ใช้ที่ล็อกอินแล้ว ("/") แตกต่างกันตามบทบาท: ครู -> งานของฉัน,
// ผู้บริหาร -> แดชบอร์ดผู้บริหาร, งานประกันคุณภาพ -> แดชบอร์ด
// (ผู้เยี่ยมชมที่ไม่ได้ล็อกอินจะเห็น PublicFolderPage แทน ผ่าน RootIndexRoute)
export function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "teacher") return <MyWorkPage />;
  if (user?.role === "exec") return <ExecutiveDashboardPage />;
  return <DashboardPage />;
}
