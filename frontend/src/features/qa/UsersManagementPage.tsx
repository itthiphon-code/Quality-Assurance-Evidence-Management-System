import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../lib/apiClient";
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
      className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
    >
      <input
        {...register("name", { required: true })}
        placeholder={t("management.name")}
        className="rounded-md border border-border bg-base px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <input
        {...register("email", { required: true })}
        type="email"
        placeholder={t("management.email")}
        className="rounded-md border border-border bg-base px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <select
        {...register("role", { required: true })}
        className="rounded-md border border-border bg-base px-2 py-1.5 text-sm outline-none focus:border-primary"
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
        className="rounded-md border border-border bg-base px-2 py-1.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={createUser.isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
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
      <h1 className="text-xl font-semibold text-ink">{t("management.users")}</h1>

      <div className="mt-4">
        <CreateUserPanel onCreated={(password, email) => setTempPasswordNotice({ email, password })} />
      </div>

      {tempPasswordNotice && (
        <div className="mt-3 rounded-md border border-accent-gold bg-primary-tint px-3 py-2 text-sm text-primary-700 dark:bg-surface-alt dark:text-accent-gold">
          {t("management.tempPasswordNotice")}: <strong>{tempPasswordNotice.email}</strong> /{" "}
          <code className="font-mono">{tempPasswordNotice.password}</code>
        </div>
      )}

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2">{t("management.name")}</th>
                <th className="px-3 py-2">{t("management.email")}</th>
                <th className="px-3 py-2">{t("management.role")}</th>
                <th className="px-3 py-2">{t("management.department")}</th>
                <th className="px-3 py-2">{t("management.status")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2 text-muted">{user.email}</td>
                  <td className="px-3 py-2">{t(`role.${user.role}`)}</td>
                  <td className="px-3 py-2 text-muted">{user.department ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={user.isActive ? "text-status-success" : "text-status-danger"}>
                      {user.isActive ? t("management.active") : t("management.inactive")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus.mutate({ id: user.id, isActive: !user.isActive })}
                      className="text-xs text-primary-700 underline dark:text-primary"
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
