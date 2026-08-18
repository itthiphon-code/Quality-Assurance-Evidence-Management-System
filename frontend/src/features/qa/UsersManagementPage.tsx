import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { KeyRound, Pencil, UserPlus, X } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ListSkeleton } from "../../components/ui/Skeleton";
import type { UserRole } from "../auth/authContext";

interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  isActive: boolean;
}

interface CreateUserForm {
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

const ROLES: UserRole[] = ["teacher", "qa", "exec"];

const inputClass =
  "w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

function CreateUserPanel({ onCreated }: { onCreated: (tempPassword: string, email: string) => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<CreateUserForm>({ defaultValues: { role: "teacher" } });

  const createUser = useMutation({
    mutationFn: (input: CreateUserForm) => apiClient.post("/users", input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onCreated(res.data.tempPassword, res.data.email);
      reset();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => createUser.mutate(values))}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <input {...register("name", { required: true })} placeholder={t("management.name")} className={inputClass} />
      <input
        {...register("email", { required: true })}
        type="email"
        placeholder={t("management.email")}
        className={inputClass}
      />
      <select {...register("role", { required: true })} className={inputClass}>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {t(`role.${r}`)}
          </option>
        ))}
      </select>
      <input {...register("department")} placeholder={t("management.department")} className={inputClass} />
      <button
        type="submit"
        disabled={createUser.isPending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        {t("management.createUser")}
      </button>
    </form>
  );
}

// แถวผู้ใช้ 1 คน — สลับระหว่างโหมดอ่านกับโหมดแก้ไขในแถวเดียวกัน (ไม่เปิด modal ซ้อน)
function UserRow({
  user,
  onPasswordReset,
}: {
  user: UserDto;
  onPasswordReset: (email: string, password: string) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department ?? "",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const save = useMutation({
    mutationFn: () => apiClient.patch(`/users/${user.id}`, form),
    onSuccess: () => {
      setError(null);
      setEditing(false);
      invalidate();
    },
    onError: (err: AxiosError) => {
      setError(err.response?.status === 409 ? t("management.emailInUse") : t("management.saveFailed"));
    },
  });

  const toggleStatus = useMutation({
    mutationFn: () => apiClient.patch(`/users/${user.id}/status`, { isActive: !user.isActive }),
    onSuccess: invalidate,
  });

  const resetPassword = useMutation({
    mutationFn: () => apiClient.post(`/users/${user.id}/reset-password`),
    onSuccess: (res) => {
      setConfirmingReset(false);
      onPasswordReset(res.data.email, res.data.tempPassword);
    },
  });

  const startEdit = () => {
    setForm({ name: user.name, email: user.email, role: user.role, department: user.department ?? "" });
    setError(null);
    setEditing(true);
  };

  if (editing) {
    return (
      <tr className="border-b border-border bg-surface-alt/50 last:border-0">
        <td colSpan={6} className="px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{t("management.name")}</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{t("management.email")}</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{t("management.role")}</span>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`role.${r}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{t("management.department")}</span>
              <input
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          {error && <p className="mt-2 text-xs text-status-danger">{error}</p>}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={!form.name.trim() || !form.email.trim() || save.isPending}
              onClick={() => save.mutate()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {t("common.save")}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-alt">
      <td className="px-4 py-2.5 font-medium text-ink">{user.name}</td>
      <td className="px-4 py-2.5 text-muted">{user.email}</td>
      <td className="px-4 py-2.5">
        <span className="inline-flex whitespace-nowrap rounded-md bg-surface-alt px-2 py-0.5 text-xs font-medium text-ink">
          {t(`role.${user.role}`)}
        </span>
      </td>
      <td className="px-4 py-2.5 text-muted">{user.department ?? "—"}</td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
            user.isActive ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {user.isActive ? t("management.active") : t("management.inactive")}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={startEdit}
            title={t("management.edit")}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-tint dark:text-primary dark:hover:bg-surface-alt"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("management.edit")}
          </button>
          <button
            type="button"
            disabled={resetPassword.isPending}
            onClick={() => setConfirmingReset(true)}
            title={t("management.resetPassword")}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-alt hover:text-ink disabled:opacity-50"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {t("management.resetPassword")}
          </button>
          {confirmingReset && (
            <ConfirmDialog
              tone="danger"
              title={t("management.resetPassword")}
              message={t("management.resetPasswordConfirm")}
              confirmLabel={t("management.resetPassword")}
              onConfirm={() => resetPassword.mutate()}
              onCancel={() => setConfirmingReset(false)}
            />
          )}
          <button
            type="button"
            onClick={() => toggleStatus.mutate()}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-alt ${
              user.isActive ? "text-status-danger" : "text-status-success"
            }`}
          >
            {user.isActive ? t("management.deactivate") : t("management.activate")}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function UsersManagementPage() {
  const { t } = useTranslation();
  const [passwordNotice, setPasswordNotice] = useState<{ email: string; password: string; isReset: boolean } | null>(
    null,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await apiClient.get<UserDto[]>("/users")).data,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">{t("management.users")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("management.usersSubtitle")}</p>
      </div>

      <div className="mt-5">
        <Card title={t("management.createUser")}>
          <CreateUserPanel
            onCreated={(password, email) => setPasswordNotice({ email, password, isReset: false })}
          />
        </Card>
      </div>

      {passwordNotice && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-accent-gold bg-primary-tint px-4 py-3 text-sm text-primary-700 dark:bg-surface-alt dark:text-accent-gold">
          <div>
            <p className="font-medium">
              {passwordNotice.isReset ? t("management.resetPasswordNotice") : t("management.tempPasswordNotice")}
            </p>
            <p className="mt-1">
              <strong>{passwordNotice.email}</strong> /{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono dark:bg-white/10">
                {passwordNotice.password}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordNotice(null)}
            aria-label={t("common.cancel")}
            className="shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5">{t("management.name")}</th>
                <th className="px-4 py-2.5">{t("management.email")}</th>
                <th className="px-4 py-2.5">{t("management.role")}</th>
                <th className="px-4 py-2.5">{t("management.department")}</th>
                <th className="px-4 py-2.5">{t("management.status")}</th>
                <th className="px-4 py-2.5 text-right">{t("management.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onPasswordReset={(email, password) => setPasswordNotice({ email, password, isReset: true })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
