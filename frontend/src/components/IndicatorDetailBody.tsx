import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AttachmentIcon } from "./AttachmentIcon";
import { Skeleton } from "./ui/Skeleton";
import { AttachmentUploader } from "./AttachmentUploader";
import { StatusBadge } from "./StatusBadge";
import { openAttachment } from "../lib/attachments";
import { apiClient } from "../lib/apiClient";

interface AttachmentDto {
  id: string;
  type: "file" | "drive_link";
  filename: string;
  size: number | null;
  uploadedAt: string;
  uploadedBy?: { name: string };
}

interface ReviewLogDto {
  id: string;
  action: string;
  note: string | null;
  createdAt: string;
  reviewer: { name: string };
}

interface EvidenceItemDto {
  id: string;
  order: number;
  descriptionTh: string;
  descriptionEn: string;
  status: string;
  attachments: AttachmentDto[];
  reviewLogs: ReviewLogDto[];
}

interface IndicatorDetailDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  visitMethod: string;
  ownerDepartment: string | null;
  standard: { code: string; nameTh: string; nameEn: string };
  collectionMethods: { id: string; name: string }[];
  dataSources: { id: string; name: string }[];
  assignments: { user: { id: string; name: string; email: string } }[];
  evidenceItems: EvidenceItemDto[];
}

function EvidenceItemCard({ indicatorId, evidence }: { indicatorId: string; evidence: EvidenceItemDto }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const queryClient = useQueryClient();
  const queryKey = ["indicator-detail", indicatorId];
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => apiClient.delete(`/evidence/${evidence.id}/attachments/${attachmentId}`),
    onSuccess: refresh,
  });

  const submit = useMutation({
    mutationFn: () => apiClient.post(`/evidence/${evidence.id}/submit`),
    onSuccess: refresh,
  });

  const latestNote = evidence.reviewLogs.find((r) => r.action === "revise" && r.note);
  const canEdit = evidence.status === "todo" || evidence.status === "progress" || evidence.status === "revise";
  const canSubmit = (evidence.status === "progress" || evidence.status === "revise") && evidence.attachments.length > 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink">{isThai ? evidence.descriptionTh : evidence.descriptionEn}</p>
        <StatusBadge status={evidence.status} />
      </div>

      {evidence.status === "revise" && latestNote?.note && (
        <p className="mt-2 rounded-md bg-primary-tint px-3 py-2 text-xs text-primary-700 dark:bg-surface-alt dark:text-primary">
          <span className="font-semibold">{t("indicatorDetail.reviewerNote")}: </span>
          {latestNote.note}
        </p>
      )}

      {evidence.attachments.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {evidence.attachments.map((att) => (
            <li key={att.id} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-1.5 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                <AttachmentIcon type={att.type} />
                <span className="truncate">{att.filename}</span>
              </span>
              <span className="flex shrink-0 gap-2">
                <button type="button" onClick={() => openAttachment(att.id)} className="text-primary-700 underline dark:text-primary">
                  {t("indicatorDetail.open")}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteAttachment.mutate(att.id)}
                    className="text-status-danger underline"
                  >
                    {t("indicatorDetail.delete")}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {canEdit && <AttachmentUploader evidenceId={evidence.id} onChanged={refresh} />}

      {canEdit && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {!canSubmit && evidence.attachments.length === 0 && (
            <span className="text-xs text-muted">{t("indicatorDetail.submitRequiresAttachment")}</span>
          )}
          <button
            type="button"
            disabled={!canSubmit || submit.isPending}
            onClick={() => submit.mutate()}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {t("indicatorDetail.submitForReview")}
          </button>
        </div>
      )}
    </div>
  );
}

// เนื้อหารายละเอียดตัวชี้วัด — แยกออกมาจากหน้าเต็มจอเดิม เพื่อใช้ร่วมกันทั้งหน้าเต็ม (fallback
// สำหรับลิงก์ตรง/รีเฟรช) และแผงเลื่อน (Drawer) ที่เปิดจากรายการโดยไม่ออกจากหน้าปัจจุบัน
export function IndicatorDetailBody({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["indicator-detail", id],
    queryFn: async () => (await apiClient.get<IndicatorDetailDto>(`/indicators/${id}`)).data,
    enabled: Boolean(id),
  });

  return (
    <>
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      )}
      {isError && <p className="text-sm text-status-danger">{t("common.error")}</p>}

      {data && (
        <>
          <div>
            <span className="text-xs font-medium text-muted">{data.standard.code}</span>
            <h1 className="text-xl font-semibold text-ink">
              {data.code} — {isThai ? data.nameTh : data.nameEn}
            </h1>
            {data.ownerDepartment && (
              <p className="mt-1 text-sm text-muted">
                {t("indicatorDetail.owner")}: {data.ownerDepartment}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {data.collectionMethods.length > 0 && (
                <span>
                  {t("indicatorDetail.collectionMethods")}: {data.collectionMethods.map((m) => m.name).join(", ")}
                </span>
              )}
              {data.dataSources.length > 0 && (
                <span>
                  {t("indicatorDetail.dataSources")}: {data.dataSources.map((s) => s.name).join(", ")}
                </span>
              )}
            </div>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
            {t("indicatorDetail.evidenceChecklist")}
          </h2>
          <div className="space-y-3">
            {data.evidenceItems.map((evidence) => (
              <EvidenceItemCard key={evidence.id} indicatorId={data.id} evidence={evidence} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
