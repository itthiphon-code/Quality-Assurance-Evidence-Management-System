import { useTranslation } from "react-i18next";
import { getStandardAccent } from "../../lib/standardColor";

interface StandardComparisonItem {
  standardId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  approved: number;
  total: number;
}

// ใช้สีตามอัตลักษณ์ของแต่ละมาตรฐาน (ไม่ใช่สีสถานะ) เพื่อเปรียบเทียบระหว่างมาตรฐานได้ชัดเจน
// แม้ในกรณีที่ทุกรายการผ่านการตรวจสอบแล้วทั้งหมด (สีสถานะเดียวจะดูจืดชืดไม่สื่อความหมาย)
const PALETTE = ["bg-primary", "bg-accent-gold", "bg-status-pending"];

export function StandardComparisonBars({ data }: { data: StandardComparisonItem[] }) {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    <div className="space-y-4">
      {data.map((std, i) => {
        const pct = std.total > 0 ? Math.round((std.approved / std.total) * 100) : 0;
        return (
          <div key={std.standardId}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                {(() => {
                  const Icon = getStandardAccent(std.code).icon;
                  return <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />;
                })()}
                {/* คงรหัสมาตรฐานไว้สำหรับโปรแกรมอ่านหน้าจอ แม้จะแทนด้วยสัญลักษณ์บนหน้าจอแล้ว */}
                <span className="sr-only">{std.code}</span>
                <span className="truncate">{isThai ? std.nameTh : std.nameEn}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-muted">
                {std.approved}/{std.total} ({pct}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-alt">
              <div
                className={`h-full rounded-full transition-all ${PALETTE[i % PALETTE.length]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
