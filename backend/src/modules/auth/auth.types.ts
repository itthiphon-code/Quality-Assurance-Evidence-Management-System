import type { UserRole } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string; // userId
  role: UserRole;
  email: string;
}
