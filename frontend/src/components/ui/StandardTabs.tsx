import { useTranslation } from "react-i18next";
import { getStandardAccent } from "../../lib/standardColor";

export interface StandardTabItem {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  indicatorCount: number;
}

interface StandardTabsProps {
  items: StandardTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

// แท็บแยกมาตรฐาน — เดิมหน้าแฟ้มแสดงทั้ง 3 มาตรฐาน 10 ตัวชี้วัดต่อกันยาวเป็นหน้าเดียว
// ผู้ตรวจต้องเลื่อนหาเอง จึงตัดเป็นแท็บให้กระโดดตรงไปยังมาตรฐานที่ต้องการได้ทันที
export function StandardTabs({ items, activeId, onChange }: StandardTabsProps) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  return (
    // จอแคบเลื่อนแท็บแนวนอนได้ ไม่บีบตัวอักษรจนอ่านไม่ออก
    <div role="tablist" aria-label={t("public.folderTitle")} className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const accent = getStandardAccent(item.code);
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`flex min-w-0 shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-left transition-colors ${
              active
                ? "border-transparent bg-surface shadow-sm ring-2 ring-primary/40"
                : "border-border bg-surface/60 hover:bg-surface"
            }`}
          >
            <span className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${accent.chip}`}>
              {item.code}
            </span>
            <span className="min-w-0">
              <span
                className={`block max-w-[16rem] truncate text-sm ${active ? "font-semibold text-ink" : "text-muted"}`}
              >
                {isThai ? item.nameTh : item.nameEn}
              </span>
              <span className="block text-xs text-muted">
                {item.indicatorCount} {t("common.indicators")}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
