import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../lib/apiClient";
import { Card } from "../../components/ui/Card";
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
      <input
        {...register("name", { required: true })}
        placeholder={t("management.name")}
        className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <input
        {...register("email", { required: true })}
        type="email"
        placeholder={t("management.email")}
        className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <select
        {...register("role", { required: true })}
        className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {t(`role.${r}`)}
          </option>
        ))}
      </select>
      <input
        {...register("department")}
        placeholder={t("management.department")}
        className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={createUser.isPending}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        {t("management.createUser")}
      </button>
    </form>
  );
}

export function UsersManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tempPasswordNotice, setTempPasswordNotice] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await apiClient.get<UserDto[]>("/users")).data,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">{t("management.users")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("management.usersSubtitle")}</p>
      </div>

      <div className="mt-5">
        <Card title={t("management.createUser")}>
          <CreateUserPanel onCreated={(password, email) => setTempPasswordNotice({ email, password })} />
        </Card>
      </div>

      {tempPasswordNotice && (
        <div className="mt-4 rounded-xl border border-accent-gold bg-primary-tint px-4 py-3 text-sm text-primary-700 dark:bg-surface-alt dark:text-accent-gold">
          {t("management.tempPasswordNotice")}: <strong>{tempPasswordNotice.email}</strong> /{" "}
          <code className="font-mono">{tempPasswordNotice.password}</code>
        </div>
      )}

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
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
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="border-b border-border transition-colors last:border-0 hover:bg-surface-alt">
                  <td className="px-4 py-2.5 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-2.5 text-muted">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex rounded-md bg-surface-alt px-2 py-0.5 text-xs font-medium text-ink">
                      {t(`role.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{user.department ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-status-success/10 text-status-success"
                          : "bg-status-danger/10 text-status-danger"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {user.isActive ? t("management.active") : t("management.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus.mutate({ id: user.id, isActive: !user.isActive })}
                      className="text-xs font-medium text-primary-700 underline dark:text-primary"
                    >
                      {user.isActive ? t("management.deactivate") : t("management.activate")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
