import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { IndicatorDetailBody } from "./IndicatorDetailBody";

interface IndicatorDrawerProps {
  id: string;
  onClose: () => void;
}

const TRANSITION_MS = 200;

// แผงเลื่อนจากขวาแสดงรายละเอียดตัวชี้วัด — เปิดจากรายการ (งานของฉัน / ตารางความพร้อมของ QA)
// โดยไม่ออกจากหน้าปัจจุบัน ปิดด้วยปุ่ม X, กด Esc, หรือคลิกฉากหลัง
// (ปิดแบบ delay ให้ทันทรานซิชัน slide-out ก่อนค่อยเรียก onClose จริงที่ไปเปลี่ยนเส้นทาง)
export function IndicatorDrawer({ id, onClose }: IndicatorDrawerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, TRANSITION_MS);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label={t("common.closeMenu")}
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-lg transition-transform duration-200 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("indicatorDetail.title")}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("common.closeMenu")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <IndicatorDetailBody id={id} />
        </div>
      </div>
    </div>
  );
}
