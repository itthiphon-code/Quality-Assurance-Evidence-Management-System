import { useTranslation } from "react-i18next";
import { progressColorClass, progressTextColorClass } from "../lib/progressColor";
import { getStandardAccent } from "../lib/standardColor";
import type { IndicatorReadiness } from "./IndicatorReadinessTable";

// มุมมองแบบ "ตารางความพร้อม" ย่อส่วนเป็นการ์ดสีไล่ระดับ ให้กวาดสายตาดูภาพรวมทั้ง 10 ตัวชี้วัดได้เร็ว
// เสริมจากตาราง IndicatorReadinessTable แบบละเอียด ไม่ได้แทนที่กัน
// ขอบซ้าย + ป้ายรหัสใช้สีประจำมาตรฐาน (ไม่ใช่สีสถานะ) เพื่อแยกกลุ่มด้วยสายตาได้แม้ทุกใบจะพร้อม 100% เท่ากัน
export function IndicatorReadinessGrid({ data }: { data: IndicatorReadiness[] }) {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {data.map((ind) => {
        const accent = getStandardAccent(ind.standardCode);
        return (
          <div
            key={ind.id}
            className={`rounded-2xl border border-l-4 border-border bg-surface p-4 shadow-sm ${accent.border}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${accent.chip}`}>
                {ind.code}
              </span>
              <span className={`text-sm font-bold ${progressTextColorClass(ind.pctComplete)}`}>
                {ind.pctComplete}%
              </span>
            </div>
            <p className="mt-2 line-clamp-2 h-8 text-xs text-muted">{isThai ? ind.nameTh : ind.nameEn}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
              <div
                className={`h-full rounded-full transition-all ${progressColorClass(ind.pctComplete)}`}
                style={{ width: `${ind.pctComplete}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
