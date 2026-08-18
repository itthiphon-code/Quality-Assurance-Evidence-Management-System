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

export function StandardProgressChart({ data }: { data: StandardCounts[] }) {
  const { t } = useTranslation();
  const colors = useStatusColors();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
        <XAxis dataKey="code" tick={{ fill: colors.muted, fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 12 }} />
        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-color)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
        {ORDER.map((status) => (
          <Bar key={status} dataKey={status} stackId="status" name={t(`status.${status}`)} fill={colors[status]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
