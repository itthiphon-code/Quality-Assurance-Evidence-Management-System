import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, getAccessToken, setAccessToken } from "../../lib/apiClient";

// ไม่มี "assessor" — บทบาทผู้ประเมิน สมศ. เข้าถึงระบบผ่านหน้าเว็บสาธารณะ (ไม่ล็อกอิน) แทน
export type UserRole = "teacher" | "qa" | "exec";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient
      .get<AuthUser>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const res = await apiClient.post("/auth/login", { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data.user as AuthUser;
      },
      logout: () => {
        setAccessToken(null);
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
