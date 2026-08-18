import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { logAudit } from "../../middleware/audit";
import {
  InvalidCredentialsError,
  signAccessToken,
  signRefreshToken,
  verifyCredentials,
  verifyRefreshToken,
} from "./auth.service";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(email, password);

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id });

    await logAudit({ userId: user.id, action: "login", entityType: "User", entityId: user.id });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid email or password" } });
    }
    next(err);
  }
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: { message: "Invalid refresh token" } });
    }
    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: { message: "Invalid or expired refresh token" } });
  }
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: { message: "User not found" } });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (err) {
    next(err);
  }
});
