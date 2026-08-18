import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service";
import type { AccessTokenPayload } from "../modules/auth/auth.types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Missing bearer token" } });
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}
