import { useEffect, useState } from "react";
import { useTheme } from "../app/ThemeProvider";

export type EvidenceStatus = "todo" | "progress" | "review" | "approved" | "revise";

const CSS_VARS = {
  todo: "--chart-neutral",
  progress: "--status-pending",
  review: "--accent-gold",
  approved: "--status-success",
  revise: "--status-danger",
  muted: "--text-muted",
  border: "--border-color",
} as const;

type ChartColors = Record<keyof typeof CSS_VARS, string>;

// Recharts ต้องการค่าสี literal ไม่ใช่ CSS var — hook นี้อ่านค่าที่ resolve แล้วจาก
// :root ปัจจุบัน (สถานะใช้สีชุดเดียวกับ StatusBadge) และอ่านใหม่ทุกครั้งที่สลับธีม
export function useStatusColors(): ChartColors {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(() => resolveColors());

  useEffect(() => {
    setColors(resolveColors());
  }, [theme]);

  return colors;
}

function resolveColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const entries = Object.entries(CSS_VARS) as [keyof typeof CSS_VARS, string][];
  return Object.fromEntries(entries.map(([key, varName]) => [key, style.getPropertyValue(varName).trim()])) as ChartColors;
}
