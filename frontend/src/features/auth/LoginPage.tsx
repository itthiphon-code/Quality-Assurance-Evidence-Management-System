import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-4 py-10 text-ink">
      {/* แสงไล่สีแบรนด์จาง ๆ ด้านหลังการ์ด — ใช้เฉพาะ --primary เพื่อไม่หลุดโทนสี */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ background: "radial-gradient(1100px 550px at 15% -10%, var(--primary), transparent 60%)" }}
      />

      <Link
        to="/"
        className="absolute left-4 top-4 z-10 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-tint">
          QA
        </span>
        {t("app.title")}
      </Link>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="relative z-0 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface shadow-lg md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-primary-800 to-primary-700 p-9 text-white md:flex">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold leading-snug">{t("app.fullTitle")}</h1>
            <p className="mt-3 text-sm text-white/80">{t("app.orgSubtitle")}</p>
          </div>
          <div className="border-t border-white/20 pt-4 text-xs text-white/70">{t("app.orgName")}</div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-6 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-tint">
              QA
            </div>
            <h1 className="mt-3 text-lg font-semibold">{t("app.fullTitle")}</h1>
            <p className="mt-1 text-xs text-muted">{t("app.orgName")}</p>
          </div>

          <h2 className="text-lg font-semibold text-ink">{t("auth.loginTitle")}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", { required: true })}
                className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && <p className="text-sm text-status-danger">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {t("auth.loginButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
