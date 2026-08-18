import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.controller";
import { standardsRouter } from "./modules/standards/standards.controller";
import { usersRouter } from "./modules/users/users.controller";
import { indicatorsRouter } from "./modules/indicators/indicators.controller";
import { evidenceRouter } from "./modules/evidence/evidence.controller";
import { attachmentsRouter } from "./modules/attachments/attachments.controller";
import { notificationsRouter } from "./modules/notifications/notifications.controller";
import { publicRouter } from "./modules/public/public.controller";
import { dashboardRouter } from "./modules/dashboard/dashboard.controller";
import { reportsRouter } from "./modules/reports/reports.controller";
import { apiLimiter } from "./middleware/rateLimit";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRouter);
app.use("/api/standards", standardsRouter);
app.use("/api/users", usersRouter);
app.use("/api/indicators", indicatorsRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/public", publicRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
});

app.use(errorHandler);
