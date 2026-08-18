import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../lib/apiClient";
import { useToast } from "./ui/ToastProvider";

interface AttachmentUploaderProps {
  evidenceId: string;
  onChanged: () => void;
}

export function AttachmentUploader({ evidenceId, onChanged }: AttachmentUploaderProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [mode, setMode] = useState<"file" | "link">("file");
  const [driveUrl, setDriveUrl] = useState("");
  const [driveName, setDriveName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      // ไม่กำหนด Content-Type เอง — ต้องปล่อยให้ browser/axios ใส่ boundary ของ multipart ให้อัตโนมัติ
      return apiClient.post(`/evidence/${evidenceId}/attachments`, formData);
    },
    onSuccess: () => {
      setError(null);
      onChanged();
      toast.success(t("toast.attachmentAdded"));
    },
    onError: () => setError(t("common.error")),
  });

  const attachLink = useMutation({
    mutationFn: () =>
      apiClient.post(`/evidence/${evidenceId}/attachments`, {
        type: "drive_link",
        url: driveUrl,
        filename: driveName || undefined,
      }),
    onSuccess: () => {
      setError(null);
      setDriveUrl("");
      setDriveName("");
      onChanged();
      toast.success(t("toast.attachmentAdded"));
    },
    onError: () => setError(t("common.error")),
  });

  return (
    <div className="mt-2 rounded-lg border border-dashed border-border p-3">
      <div className="mb-2 flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={mode === "file" ? "font-semibold text-primary-700 dark:text-primary" : "text-muted"}
        >
          {t("indicatorDetail.uploadFile")}
        </button>
        <span className="text-muted">/</span>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={mode === "link" ? "font-semibold text-primary-700 dark:text-primary" : "text-muted"}
        >
          {t("indicatorDetail.attachLink")}
        </button>
      </div>

      {mode === "file" ? (
        <input
          type="file"
          disabled={uploadFile.isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile.mutate(file);
            e.target.value = "";
          }}
          className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-tint hover:file:bg-primary-700"
        />
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder={t("indicatorDetail.driveLinkUrl")}
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            className="w-full rounded-md border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder={t("indicatorDetail.driveLinkName")}
            value={driveName}
            onChange={(e) => setDriveName(e.target.value)}
            className="w-full rounded-md border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted">{t("indicatorDetail.driveLinkHint")}</p>
          <button
            type="button"
            disabled={!driveUrl || attachLink.isPending}
            onClick={() => attachLink.mutate()}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-tint transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {t("indicatorDetail.attach")}
          </button>
        </div>
      )}

      {uploadFile.isPending && <p className="mt-1 text-xs text-muted">{t("indicatorDetail.uploading")}</p>}
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}
