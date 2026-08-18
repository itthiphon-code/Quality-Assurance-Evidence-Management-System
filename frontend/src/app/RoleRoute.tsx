import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../features/auth/authContext";

// จำกัดสิทธิ์เข้าถึงหน้าตามบทบาท — ใช้ซ้อนภายใน ProtectedRoute (ซึ่งจัดการเรื่อง auth แล้ว)
export function RoleRoute({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
