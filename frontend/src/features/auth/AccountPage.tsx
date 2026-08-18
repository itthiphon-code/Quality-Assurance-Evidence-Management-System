import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { CheckCircle2 } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { Card } from "../../components/ui/Card";
import { useAuth } from "./authContext";

const inputClass =
  "w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary";

// หน้าบัญชีของผู้ใช้ที่ล็อกอินอยู่ — ดูข้อมูลตนเองและเปลี่ยนรหัสผ่านได้เอง
// (การแก้ชื่อ/บทบาท/หน่วยงาน ยังเป็นสิทธิ์ของงานประกันคุณภาพผ่านหน้าจัดการผู้ใช้ ตามตาราง RBAC)
export function AccountPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const changePassword = useMutation({
    mutationFn: () => apiClient.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      setError(null);
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: AxiosError) => {
      setDone(false);
      setError(err.response?.status === 401 ? t("account.currentPasswordWrong") : t("common.error"));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(false);
    if (newPassword.length < 8) return setError(t("account.passwordTooShort"));
    if (newPassword !== confirmPassword) return setError(t("account.passwordMismatch"));
    setError(null);
    changePassword.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">{t("account.title")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("account.subtitle")}</p>
      </div>

      <div className="mt-5">
        <Card title={t("account.profile")}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted">{t("management.name")}</dt>
              <dd className="mt-0.5 text-sm text-ink">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("management.email")}</dt>
              <dd className="mt-0.5 text-sm text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("management.role")}</dt>
              <dd className="mt-0.5 text-sm text-ink">{user ? t(`role.${user.role}`) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("management.department")}</dt>
              <dd className="mt-0.5 text-sm text-ink">{user?.department || "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-4">
        <Card title={t("account.changePassword")}>
          <form onSubmit={submit} className="max-w-sm space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="currentPassword">
                {t("account.currentPassword")}
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="newPassword">
                {t("account.newPassword")}
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted">{t("account.passwordHint")}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="confirmPassword">
                {t("account.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-status-danger">{error}</p>}
            {done && (
              <p className="flex items-center gap-1.5 text-sm text-status-success">
                <CheckCircle2 className="h-4 w-4" />
                {t("account.passwordChanged")}
              </p>
            )}

            <button
              type="submit"
              disabled={!currentPassword || !newPassword || !confirmPassword || changePassword.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {t("account.changePassword")}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
