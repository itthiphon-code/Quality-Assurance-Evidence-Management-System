import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AttachmentIcon } from "./AttachmentIcon";
import { Skeleton } from "./ui/Skeleton";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { useToast } from "./ui/ToastProvider";
import { AttachmentUploader } from "./AttachmentUploader";
import { StatusBadge } from "./StatusBadge";
import { openAttachment } from "../lib/attachments";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../features/auth/authContext";

interface AttachmentDto {
  id: string;
  type: "file" | "drive_link";
  filename: string;
  title: string | null;
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

const EVIDENCE_STATUSES = ["todo", "progress", "review", "approved", "revise"] as const;

// แถวเอกสารแนบ 1 รายการ — แสดง "ชื่อเอกสาร" ที่ผู้ใช้ตั้งไว้ ถ้ายังไม่ได้ตั้งจึงแสดงชื่อไฟล์แทน
// และให้แก้ชื่อได้ในแถวเดียวกันโดยไม่ต้องเปิดหน้าต่างซ้อน
function AttachmentRow({
  evidenceId,
  attachment,
  canEdit,
  onChanged,
  onDelete,
}: {
  evidenceId: string;
  attachment: AttachmentDto;
  canEdit: boolean;
  onChanged: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState(attachment.title ?? "");

  const rename = useMutation({
    mutationFn: () => apiClient.patch(`/evidence/${evidenceId}/attachments/${attachment.id}`, { title: draft }),
    onSuccess: () => {
      setEditing(false);
      onChanged();
      toast.success(t("toast.attachmentRenamed"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const displayName = attachment.title?.trim() || attachment.filename;

  if (editing) {
    return (
      <li className="rounded-md bg-surface-alt px-3 py-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") rename.mutate();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder={t("indicatorDetail.attachmentTitlePlaceholder")}
          className="w-full rounded-md border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
        />
        {/* ชื่อไฟล์จริงยังแสดงไว้ให้เห็นว่ากำลังตั้งชื่อให้ไฟล์ไหน */}
        <p className="mt-1 truncate text-[11px] text-muted">{attachment.filename}</p>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted">
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={rename.isPending}
            onClick={() => rename.mutate()}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-tint hover:bg-primary-700 disabled:opacity-50"
          >
            {t("common.save")}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-1.5 text-xs">
      <span className="flex min-w-0 items-center gap-1.5">
        <AttachmentIcon type={attachment.type} />
        <span className="truncate">{displayName}</span>
      </span>
      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => openAttachment(attachment.id)}
          className="text-primary-700 underline dark:text-primary"
        >
          {t("indicatorDetail.open")}
        </button>
        {canEdit && (
          <>
            <button
              type="button"
              onClick={() => {
                setDraft(attachment.title ?? "");
                setEditing(true);
              }}
              className="text-muted underline hover:text-ink"
            >
              {t("indicatorDetail.renameAttachment")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-status-danger underline"
            >
              {t("indicatorDetail.delete")}
            </button>
            {/* ลบเอกสารแล้วกู้คืนไม่ได้ (ไฟล์ถูกลบออกจากที่เก็บด้วย) จึงต้องยืนยันก่อนเสมอ */}
            {confirmingDelete && (
              <ConfirmDialog
                tone="danger"
                title={t("indicatorDetail.deleteAttachmentTitle")}
                message={`${displayName} — ${t("indicatorDetail.deleteAttachmentConfirm")}`}
                confirmLabel={t("indicatorDetail.delete")}
                onConfirm={() => {
                  setConfirmingDelete(false);
                  onDelete();
                }}
                onCancel={() => setConfirmingDelete(false)}
              />
            )}
          </>
        )}
      </span>
    </li>
  );
}

function EvidenceItemCard({ indicatorId, evidence }: { indicatorId: string; evidence: EvidenceItemDto }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const queryKey = ["indicator-detail", indicatorId];
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => apiClient.delete(`/evidence/${evidence.id}/attachments/${attachmentId}`),
    onSuccess: () => {
      refresh();
      toast.success(t("toast.attachmentDeleted"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const submit = useMutation({
    mutationFn: () => apiClient.post(`/evidence/${evidence.id}/submit`),
    onSuccess: () => {
      refresh();
      toast.success(t("toast.submitted"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const setStatus = useMutation({
    mutationFn: (status: string) => apiClient.patch(`/evidence/${evidence.id}/status`, { status }),
    onSuccess: () => {
      refresh();
      toast.success(t("toast.statusChanged"));
    },
    onError: () => toast.error(t("toast.failed")),
  });

  const latestNote = evidence.reviewLogs.find((r) => r.action === "revise" && r.note);
  // แนบ/ลบเอกสารได้ทุกสถานะ — รวมถึงรายการที่อนุมัติไปแล้ว เพราะการรวบรวมหลักฐานเป็นงานต่อเนื่อง
  // ความถูกต้องของสถานะคุมด้วยงานประกันคุณภาพผ่านตัวเลือก "เปลี่ยนสถานะ" ด้านล่างแทน
  const canEdit = true;
  const canSubmit = (evidence.status === "progress" || evidence.status === "revise") && evidence.attachments.length > 0;
  const isQa = user?.role === "qa";

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
            <AttachmentRow
              key={att.id}
              evidenceId={evidence.id}
              attachment={att}
              canEdit={canEdit}
              onChanged={refresh}
              onDelete={() => deleteAttachment.mutate(att.id)}
            />
          ))}
        </ul>
      )}

      {canEdit && <AttachmentUploader evidenceId={evidence.id} onChanged={refresh} />}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {/* งานประกันคุณภาพคืน/เปลี่ยนสถานะเองได้ เช่นดึงรายการที่อนุมัติแล้วกลับมาแก้ไขต่อ */}
        {isQa && (
          <label className="mr-auto flex items-center gap-1.5 text-xs text-muted">
            {t("indicatorDetail.changeStatus")}
            <select
              value={evidence.status}
              disabled={setStatus.isPending}
              onChange={(e) => setStatus.mutate(e.target.value)}
              className="rounded-md border border-border bg-base px-2 py-1 text-xs text-ink outline-none focus:border-primary disabled:opacity-50"
            >
              {EVIDENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </label>
        )}
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
