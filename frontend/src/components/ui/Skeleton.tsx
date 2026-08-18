// โครงร่างระหว่างโหลดข้อมูล — ใช้แทนข้อความ "กำลังโหลด..." เพื่อลดอาการหน้ากระโดด
// (layout shift) ตอนข้อมูลมาถึง และให้ผู้ใช้เห็นเค้าโครงหน้าจอทันที
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-alt ${className}`} />;
}

// โครงร่างมาตรฐานของหน้าแดชบอร์ด: แถวการ์ดสรุป + กราฟสองใบ
export function DashboardSkeleton() {
  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// โครงร่างรายการ/ตาราง — ระบุจำนวนแถวได้ตามหน้าที่ใช้
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
