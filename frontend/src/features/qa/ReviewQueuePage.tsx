import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../lib/apiClient";
import { openAttachment } from "../../lib/attachments";
import { AttachmentIcon } from "../../components/AttachmentIcon";
import { ListSkeleton } from "../../components/ui/Skeleton";

interface AttachmentDto {
  id: string;
  type: "file" | "drive_link";
  filename: string;
  uploadedBy?: { name: string };
}

interface ReviewQueueItemDto {
  id: string;
  descriptionTh: string;
  descriptionEn: string;
  status: string;
  attachments: AttachmentDto[];
  indicator: {
    code: string;
    nameTh: string;
    nameEn: string;
    standard: { code: string; nameTh: string; nameEn: string };
  };
}

function ReviewQueueRow({ item }: { item: ReviewQueueItemDto }) {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");
  const queryClient = useQueryClient();
  const [showReviseNote, setShowReviseNote] = useState(false);
  const [note, setNote] = useState("");

  const review = useMutation({
    mutationFn: (payload: { action: "approve" | "revise"; note?: string }) =>
      apiClient.post(`/evidence/${item.id}/review`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence", "review-queue"] });
    },
  });

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-md bg-primary-tint px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-surface-alt dark:text-primary">
          {item.indicator.standard.code} · {item.indicator.code}
        </span>
        <span className="text-xs font-medium text-muted">{isThai ? item.indicator.nameTh : item.indicator.nameEn}</span>
      </div>
      <p className="mt-2 text-sm text-ink">{isThai ? item.descriptionTh : item.descriptionEn}</p>

      <ul className="mt-2 space-y-1">
        {item.attachments.map((att) => (
          <li key={att.id} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-1.5 text-xs">
            <span className="flex min-w-0 items-center gap-1.5">
              <AttachmentIcon type={att.type} />
              <span className="truncate">
                {att.filename}
                {att.uploadedBy && (
                  <span className="text-muted">
                    {" "}
                    — {t("reviewQueue.submittedBy")} {att.uploadedBy.name}
                  </span>
                )}
              </span>
            </span>
            <button type="button" onClick={() => openAttachment(att.id)} className="shrink-0 text-primary-700 underline dark:text-primary">
              {t("indicatorDetail.open")}
            </button>
          </li>
        ))}
      </ul>

      {showReviseNote ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("reviewQueue.reviseNotePlaceholder")}
            className="w-full rounded-md border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowReviseNote(false)} className="rounded-md px-3 py-1.5 text-xs text-muted">
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={!note.trim() || review.isPending}
              onClick={() => review.mutate({ action: "revise", note: note.trim() })}
              className="rounded-md bg-status-danger px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {t("reviewQueue.confirmRevise")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowReviseNote(true)}
            className="rounded-md border border-status-danger px-3 py-1.5 text-xs font-medium text-status-danger"
          >
            {t("reviewQueue.revise")}
          </button>
          <button
            type="button"
            disabled={review.isPending}
            onClick={() => review.mutate({ action: "approve" })}
            className="rounded-md bg-status-success px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {t("reviewQueue.approve")}
          </button>
        </div>
      )}
    </li>
  );
}

export function ReviewQueuePage() {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["evidence", "review-queue"],
    queryFn: async () => (await apiClient.get<ReviewQueueItemDto[]>("/evidence/review-queue")).data,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{t("reviewQueue.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("reviewQueue.subtitle")}</p>
        </div>
        {data && data.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-status-pending/10 px-3 py-1 text-sm font-semibold text-status-pending">
            {data.length} {t("common.evidenceItems")}
          </span>
        )}
      </div>

      {isLoading && <ListSkeleton rows={3} />}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      {data && data.length === 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-muted">{t("reviewQueue.empty")}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="mt-5 space-y-3">
          {data.map((item) => (
            <ReviewQueueRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
