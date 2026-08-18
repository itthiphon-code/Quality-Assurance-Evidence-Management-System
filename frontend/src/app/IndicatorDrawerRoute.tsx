import { useNavigate, useParams } from "react-router-dom";
import { IndicatorDrawer } from "../components/IndicatorDrawer";

// เชื่อม IndicatorDrawer เข้ากับ route /indicators/:id เมื่อเปิดแบบ "background location"
// (ดู App.tsx) — ปิดแผงด้วยการย้อนกลับ 1 ขั้นในประวัติ กลับไปหน้าพื้นหลังที่เปิดแผงนี้ขึ้นมา
export function IndicatorDrawerRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return null;
  return <IndicatorDrawer id={id} onClose={() => navigate(-1)} />;
}
