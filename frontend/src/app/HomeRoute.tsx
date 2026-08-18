import { useAuth } from "../features/auth/authContext";
import { AssessorFolderPage } from "../features/assessor/AssessorFolderPage";
import { ExecutiveDashboardPage } from "../features/exec/ExecutiveDashboardPage";
import { MyWorkPage } from "../features/teacher/MyWorkPage";
import { DashboardPage } from "./DashboardPage";

// หน้าแรก ("/") แตกต่างกันตามบทบาท: ครู -> งานของฉัน, ผู้ประเมิน -> แฟ้มตรวจเยี่ยม,
// ผู้บริหาร -> แดชบอร์ดผู้บริหาร, งานประกันคุณภาพ -> แดชบอร์ด
export function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "teacher") return <MyWorkPage />;
  if (user?.role === "assessor") return <AssessorFolderPage />;
  if (user?.role === "exec") return <ExecutiveDashboardPage />;
  return <DashboardPage />;
}
