import { useAuth } from "../features/auth/authContext";
import { PublicFolderPage } from "../features/public/PublicFolderPage";
import { HomeRoute } from "./HomeRoute";

// เส้นทาง "/" — ผู้เยี่ยมชมที่ไม่ได้ล็อกอินเห็นแฟ้มตรวจเยี่ยมสาธารณะ (สถิติ + หลักฐานที่ผ่านการตรวจสอบ)
// โดยไม่ต้องล็อกอิน ส่วนผู้ใช้ที่ล็อกอินแล้วเห็นหน้าแรกตามบทบาทตามปกติ
export function RootIndexRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <PublicFolderPage />;
  return <HomeRoute />;
}
