import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { computeDashboardSummary } from "./dashboard.service";

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware, requireRole("qa", "exec"));

// GET /api/dashboard/summary — สรุปภาพรวมความคืบหน้า สำหรับงานประกันคุณภาพและผู้บริหาร
dashboardRouter.get("/summary", async (_req, res, next) => {
  try {
    const summary = await computeDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});
