import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { IndicatorDetailBody } from "../../components/IndicatorDetailBody";

// หน้าเต็มจอสำหรับเปิด /indicators/:id โดยตรง (ลิงก์ตรง/รีเฟรชหน้า/บุ๊กมาร์ก) — การเปิดจากภายในระบบ
// (เช่นจากหน้างานของฉัน) ใช้ IndicatorDrawer แทนเพื่อไม่ต้องออกจากหน้าปัจจุบัน
export function IndicatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link to="/" className="text-sm text-primary-700 underline dark:text-primary">
        ← {t("indicatorDetail.back")}
      </Link>
      <div className="mt-3">{id && <IndicatorDetailBody id={id} />}</div>
    </div>
  );
}
