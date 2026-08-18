import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { Prisma, UserRole } from "@prisma/client";
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
  email: z.string().email().optional(),
  role: loginRoleSchema.optional(),
  // ส่งสตริงว่างมาได้ = ล้างค่าหน่วยงาน (เก็บเป็น null)
  department: z.string().optional(),
});

// PATCH /api/users/:id — แก้ไขชื่อ/อีเมล/บทบาท/หน่วยงาน
usersRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const data = {
      ...input,
      ...(input.department !== undefined ? { department: input.department.trim() || null } : {}),
    };

    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: userSelect });
    await logAudit({ userId: req.user!.sub, action: "update_user", entityType: "User", entityId: user.id });
    res.json(user);
  } catch (err) {
    // อีเมลซ้ำกับบัญชีอื่น — ตอบ 409 ให้หน้าเว็บแสดงข้อความที่ตรงสาเหตุ แทน 500 ทั่วไป
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({ error: { message: "อีเมลนี้ถูกใช้งานแล้ว / Email already in use" } });
    }
    next(err);
  }
});

// POST /api/users/:id/reset-password — ออกรหัสผ่านชั่วคราวใหม่ (คืนค่าเพียงครั้งเดียวใน response)
// ใช้เมื่อผู้ใช้ลืมรหัสผ่าน — งานประกันคุณภาพเป็นผู้ออกให้แล้วแจ้งผู้ใช้ผ่านช่องทางอื่น
usersRouter.post("/:id/reset-password", async (req, res, next) => {
  try {
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash },
      select: userSelect,
    });
    await logAudit({ userId: req.user!.sub, action: "reset_password", entityType: "User", entityId: user.id });
    res.json({ ...user, tempPassword });
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
