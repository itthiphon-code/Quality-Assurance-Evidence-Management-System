import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { logAudit } from "../../middleware/audit";

export const usersRouter = Router();
usersRouter.use(authMiddleware, requireRole("qa"));

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  isActive: true,
  createdAt: true,
} as const;

// ไม่รวม "assessor" — บทบาทนั้นเข้าถึงระบบผ่านหน้าเว็บสาธารณะ (ไม่ล็อกอิน) แทน
// ยังคงอยู่ใน UserRole enum ของ Prisma (ไม่ลบ เพราะไม่คุ้มความเสี่ยงจาก migration) แต่ห้ามสร้าง/แก้ไขผู้ใช้ให้เป็นบทบาทนี้อีก
const loginRoleSchema = z.enum(["teacher", "qa", "exec"]) satisfies z.ZodType<Exclude<UserRole, "assessor">>;

const listUsersQuerySchema = z.object({ role: loginRoleSchema.optional() });

// GET /api/users?role=teacher — รายชื่อผู้ใช้ (เฉพาะงานประกันคุณภาพ)
usersRouter.get("/", async (req, res, next) => {
  try {
    const { role } = listUsersQuerySchema.parse(req.query);
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: "asc" },
      select: userSelect,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: loginRoleSchema,
  department: z.string().min(1).optional(),
});

function generateTempPassword(): string {
  return randomBytes(6).toString("base64url");
}

// POST /api/users — สร้างผู้ใช้ใหม่พร้อมรหัสผ่านชั่วคราว (คืนค่าเพียงครั้งเดียวใน response)
usersRouter.post("/", async (req, res, next) => {
  try {
    const input = createUserSchema.parse(req.body);
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: { ...input, passwordHash },
      select: userSelect,
    });

    await logAudit({ userId: req.user!.sub, action: "create_user", entityType: "User", entityId: user.id });

    res.status(201).json({ ...user, tempPassword });
  } catch (err) {
    next(err);
  }
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: loginRoleSchema.optional(),
  department: z.string().min(1).optional(),
});

// PATCH /api/users/:id — แก้ไขชื่อ/บทบาท/หน่วยงาน
usersRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: userSelect });
    await logAudit({ userId: req.user!.sub, action: "update_user", entityType: "User", entityId: user.id });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({ isActive: z.boolean() });

// PATCH /api/users/:id/status — เปิด/ปิดการใช้งานบัญชี
usersRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const { isActive } = statusSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive }, select: userSelect });
    await logAudit({
      userId: req.user!.sub,
      action: isActive ? "activate_user" : "deactivate_user",
      entityType: "User",
      entityId: user.id,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
