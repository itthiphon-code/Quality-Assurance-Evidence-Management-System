import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

// การ์ดพื้นฐานที่ใช้ร่วมกันทั้งระบบ — รวม pattern "rounded-xl border bg-surface shadow-sm"
// ที่เดิมกระจายอยู่ในหลายหน้าให้เป็นจุดเดียว
export function Card({ title, subtitle, action, className = "", children }: CardProps) {
  const hasHeader = Boolean(title || subtitle || action);
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 shadow-sm ${className}`}>
      {hasHeader && (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
            {action}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
