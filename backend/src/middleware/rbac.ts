import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

// จำกัดสิทธิ์เข้าถึง endpoint ตามบทบาทผู้ใช้ (RBAC)
// ต้องใช้งานหลัง authMiddleware เสมอ เนื่องจากต้องอ่าน req.user
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: "Unauthenticated" } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: "Forbidden: insufficient role" } });
    }
    next();
  };
}
