import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/ToastProvider";

interface AssignmentDto {
  user: { id: string; name: string; email: string };
}

interface IndicatorDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  visitMethod: string;
  ownerDepartment: string | null;
  standard: { code: string };
  assignments: AssignmentDto[];
}

interface TeacherDto {
  id: string;
  name: string;
  email: string;
}

function IndicatorRow({ indicator, teachers }: { indicator: IndicatorDto; teachers: TeacherDto[] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [nameTh, setNameTh] = useState(indicator.nameTh);
  const [nameEn, setNameEn] = useState(indicator.nameEn);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["indicators", "all"] });

  const saveNames = useMutation({
    mutationFn: () => apiClient.patch(`/indicators/${indicator.id}`, { nameTh, nameEn }),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.saved"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const assign = useMutation({
    mutationFn: (userId: string) => apiClient.post(`/indicators/${indicator.id}/assignments`, { userId }),
    onSuccess: () => {
      setSelectedTeacher("");
      invalidate();
      toast.success(t("toast.assigned"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const unassign = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/indicators/${indicator.id}/assignments/${userId}`),
    onSuccess: () => {
      invalidate();
      toast.success(t("toast.unassigned"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const assignedIds = new Set(indicator.assignments.map((a) => a.user.id));
  const availableTeachers = teachers.filter((tch) => !assignedIds.has(tch.id));
  const dirty = nameTh !== indicator.nameTh || nameEn !== indicator.nameEn;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
        {indicator.standard.code} · {indicator.code}
      </span>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      {dirty && (
        <button
          type="button"
          onClick={() => saveNames.mutate()}
          disabled={saveNames.isPending}
          className="mt-2 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-tint hover:bg-primary-700"
        >
          {t("common.save")}
        </button>
      )}

      <div className="mt-3">
        <p className="mb-1 text-xs font-medium text-muted">{t("management.assignedTeachers")}</p>
        <div className="flex flex-wrap gap-2">
          {indicator.assignments.map((a) => (
            <span
              key={a.user.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs"
            >
              {a.user.name}
              <button
                type="button"
                onClick={() => unassign.mutate(a.user.id)}
                className="text-status-danger"
                aria-label={t("management.removeAssignment")}
              >
                ×
              </button>
            </span>
          ))}
          {indicator.assignments.length === 0 && <span className="text-xs text-muted">—</span>}
        </div>
        <div className="mt-2 flex gap-2">
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="rounded-md border border-border bg-base px-2 py-1 text-xs outline-none focus:border-primary"
          >
            <option value="">{t("management.selectUser")}</option>
            {availableTeachers.map((tch) => (
              <option key={tch.id} value={tch.id}>
                {tch.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedTeacher || assign.isPending}
            onClick={() => assign.mutate(selectedTeacher)}
            className="rounded-md border border-primary px-2 py-1 text-xs font-medium text-primary-700 disabled:opacity-50 dark:text-primary"
          >
            {t("management.addAssignment")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function IndicatorsManagementPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data: indicators, isLoading, isError } = useQuery({
    queryKey: ["indicators", "all"],
    queryFn: async () => (await apiClient.get<IndicatorDto[]>("/indicators")).data,
  });

  const { data: teachers } = useQuery({
    queryKey: ["users", "teacher"],
    queryFn: async () => (await apiClient.get<TeacherDto[]>("/users?role=teacher")).data,
  });

  const q = search.trim().toLowerCase();
  const visible = (indicators ?? []).filter(
    (ind) =>
      !q ||
      ind.code.toLowerCase().includes(q) ||
      ind.nameTh.toLowerCase().includes(q) ||
      ind.nameEn.toLowerCase().includes(q),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-700 p-6 text-white shadow-sm sm:p-7">
        <h1 className="text-xl font-semibold">{t("management.indicators")}</h1>
        <p className="mt-1 text-sm text-white/80">{t("management.indicatorsSubtitle")}</p>
      </div>

      {indicators && (
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary sm:max-w-xs"
          />
        </div>
      )}

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {indicators && (
        <div className="mt-3 space-y-3">
          {visible.length === 0 && <p className="text-sm text-muted">{t("common.noData")}</p>}
          {visible.map((ind) => (
            <IndicatorRow key={ind.id} indicator={ind} teachers={teachers ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
