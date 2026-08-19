import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { useStatusColors, type EvidenceStatus } from "../../lib/useStatusColors";

interface StandardCounts {
  code: string;
  nameTh: string;
  nameEn: string;
  todo: number;
  progress: number;
  review: number;
  approved: number;
  revise: number;
  total: number;
}

const ORDER: EvidenceStatus[] = ["approved", "review", "progress", "revise", "todo"];

interface TickProps {
  y?: number;
  payload?: { value?: string };
  labelWidth?: number;
}

// ป้ายชื่อมาตรฐานบนแกน — ใช้ foreignObject เพื่อให้เบราว์เซอร์ตัดบรรทัดเอง
// ข้อความ <text>/<tspan> ของ SVG ตัดบรรทัดอัตโนมัติไม่ได้ และภาษาไทยไม่มีช่องว่างระหว่างคำ
// การตัดเองด้วยจำนวนตัวอักษรจึงมักตัดกลางคำ ปล่อยให้เบราว์เซอร์จัดการจะได้ผลถูกต้องกว่า
function StandardNameTick({ y = 0, payload, labelWidth = 200 }: TickProps) {
  return (
    <foreignObject x={0} y={y - 26} width={labelWidth - 8} height={52}>
      <div className="flex h-full items-center justify-end pr-2 text-right text-[11px] leading-tight text-muted">
        <span className="line-clamp-3">{payload?.value}</span>
      </div>
    </foreignObject>
  );
}

// จอแคบต้องหดความกว้างป้ายลง ไม่งั้นป้ายกินพื้นที่จนแท่งกราฟเหลือนิดเดียวจนอ่านค่าไม่ออก
function useNarrowScreen(): boolean {
  const query = "(max-width: 640px)";
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

export function StandardProgressChart({ data }: { data: StandardCounts[] }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const colors = useStatusColors();
  const labelWidth = useNarrowScreen() ? 118 : 200;

  // แกนหมวดหมู่แสดง "ชื่อเต็ม" ของมาตรฐานแทนรหัส STD1/2/3 — วางเป็นแท่งแนวนอน
  // เพราะชื่อมาตรฐานภาษาไทยยาวเกินกว่าจะวางใต้แท่งแนวตั้งได้โดยไม่ทับกัน
  const chartData = data.map((std) => ({ ...std, label: isThai ? std.nameTh : std.nameEn }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: colors.muted, fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          interval={0}
          tickLine={false}
          tick={<StandardNameTick labelWidth={labelWidth} />}
        />
        <Tooltip
          cursor={{ fill: "var(--surface-alt)" }}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-color)", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
        {ORDER.map((status) => (
          <Bar key={status} dataKey={status} stackId="status" name={t(`status.${status}`)} fill={colors[status]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
