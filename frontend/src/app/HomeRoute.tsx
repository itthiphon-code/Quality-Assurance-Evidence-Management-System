import { useAuth } from "../features/auth/authContext";
import { MyWorkPage } from "../features/teacher/MyWorkPage";
import { DashboardPage } from "./DashboardPage";

// หน้าแรก ("/") แตกต่างกันตามบทบาท: ครู -> งานของฉัน, บทบาทอื่น -> แดชบอร์ด
export function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "teacher") return <MyWorkPage />;
  return <DashboardPage />;
}
