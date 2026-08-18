import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LangToggle } from "../../components/LangToggle";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "./authContext";

interface LoginFormValues {
  email: string;
  password: string;
}

// สำหรับผู้รับผิดชอบนำข้อมูลเข้าระบบ (ครู/งานประกันคุณภาพ) และผู้บริหารเท่านั้น
// ผู้ประเมิน สมศ./บุคคลทั่วไปเข้าดูแฟ้มตรวจเยี่ยมได้จากหน้าแรกโดยไม่ต้องเข้าสู่ระบบ
export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch {
      setError(t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-base text-ink">
      <div className="flex justify-end gap-2 p-4">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-tint">
              QA
            </div>
            <h1 className="text-lg font-semibold">{t("app.fullTitle")}</h1>
            <p className="mt-1 text-xs text-muted">{t("app.orgName")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", { required: true })}
                className="w-full rounded-md border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="password">
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", { required: true })}
                className="w-full rounded-md border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && <p className="text-sm text-status-danger">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {t("auth.loginButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
