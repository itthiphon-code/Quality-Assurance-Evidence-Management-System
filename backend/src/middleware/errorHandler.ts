import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Error handler กลาง — ต้องประกาศเป็นตัวสุดท้ายใน middleware chain
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { message: "Validation failed", issues: err.issues } });
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: { message } });
}
