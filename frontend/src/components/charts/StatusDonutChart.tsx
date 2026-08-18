import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { useStatusColors, type EvidenceStatus } from "../../lib/useStatusColors";

interface StatusDonutChartProps {
  counts: Record<EvidenceStatus, number>;
}

const ORDER: EvidenceStatus[] = ["approved", "review", "progress", "revise", "todo"];

export function StatusDonutChart({ counts }: StatusDonutChartProps) {
  const { t } = useTranslation();
  const colors = useStatusColors();

  const data = ORDER.filter((status) => counts[status] > 0).map((status) => ({
    status,
    name: t(`status.${status}`),
    value: counts[status],
  }));

  if (data.length === 0) {
    return <p className="text-sm text-muted">{t("common.noData")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={colors[entry.status]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-color)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
