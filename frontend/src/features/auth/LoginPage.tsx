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

const DEMO_ACCOUNTS = [
  { role: "teacher", email: "teacher@qaems.local" },
  { role: "qa", email: "qa@qaems.local" },
  { role: "assessor", email: "assessor@qaems.local" },
  { role: "exec", email: "exec@qaems.local" },
] as const;

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
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

          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted">{t("auth.demoAccounts")}</p>
            <ul className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("email", acc.email);
                      setValue("password", "Passw0rd!");
                    }}
                    className="text-xs text-primary-700 underline decoration-dotted hover:text-primary dark:text-primary"
                  >
                    {t(`role.${acc.role}`)} — {acc.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
