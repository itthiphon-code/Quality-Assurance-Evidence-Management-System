import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const ACCESS_TOKEN_KEY = "qaems-access-token";
const REFRESH_TOKEN_KEY = "qaems-refresh-token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

// คำขอหลายรายการอาจได้ 401 พร้อมกัน (เช่นหน้าที่ดึงข้อมูลหลายชุด) — เก็บ promise ของการต่ออายุไว้ตัวเดียว
// เพื่อไม่ให้ยิง /auth/refresh ซ้ำซ้อนหลายครั้งและได้ token คนละตัวมาทับกัน
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // ใช้ axios ตัวเปล่า ไม่ใช่ apiClient เพื่อไม่ให้คำขอนี้วนกลับเข้า interceptor ตัวเดียวกันเอง
    const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
    const token = res.data.accessToken as string;
    setAccessToken(token);
    return token;
  } catch {
    // refresh token หมดอายุ/ถูกเพิกถอน — ล้างทิ้งเพื่อให้ ProtectedRoute พากลับไปหน้าเข้าสู่ระบบ
    clearTokens();
    return null;
  }
}

// Access token มีอายุสั้น (15 นาที) ระหว่างที่ refresh token อยู่ได้ 7 วัน
// เมื่อเจอ 401 จึงต่ออายุให้อัตโนมัติแล้วยิงคำขอเดิมซ้ำ ผู้ใช้จะไม่ถูกเตะออกกลางคันระหว่างทำงาน
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const url = original?.url ?? "";
    // ไม่ต่ออายุให้กับการล็อกอิน/ต่ออายุเอง และลองซ้ำได้ครั้งเดียวเพื่อกันวนไม่รู้จบ
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/refresh");

    if (error.response?.status !== 401 || !original || original._retried || isAuthCall) {
      return Promise.reject(error);
    }

    original._retried = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const token = await refreshPromise;
    if (!token) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${token}`;
    return apiClient(original);
  },
);
