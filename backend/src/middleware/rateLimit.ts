import rateLimit from "express-rate-limit";

// จำกัดจำนวนคำขอ API โดยรวม ป้องกันการยิงคำขอถี่เกินไป
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// จำกัดการเข้าสู่ระบบเข้มงวดกว่า ป้องกันการเดารหัสผ่าน (brute force)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many login attempts, please try again later" } },
});
