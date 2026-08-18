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
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  // อัปโหลดทีละไฟล์เรียงกัน แม้ผู้ใช้จะเลือกมาหลายไฟล์พร้อมกัน — ไม่รวบยิงเป็นคำขอเดียว
  // เพราะ nginx หน้าเว็บจำกัดขนาดคำขอไว้ที่ 55MB (ดู nginx/nginx.conf) การส่งหลายไฟล์
  // รวมกันในคำขอเดียวจะทะลุเพดานทันทีทั้งที่แต่ละไฟล์ยังไม่เกิน 50MB ตามกติกาของระบบ
  const uploadFiles = useMutation({
    mutationFn: async (files: File[]) => {
      let ok = 0;
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        setProgress({ current: i + 1, total: files.length });
        const formData = new FormData();
        formData.append("file", files[i]);
        try {
          // ไม่กำหนด Content-Type เอง — ต้องปล่อยให้ browser/axios ใส่ boundary ของ multipart ให้อัตโนมัติ
          await apiClient.post(`/evidence/${evidenceId}/attachments`, formData);
          ok++;
        } catch {
          // ไฟล์เดียวพังไม่ควรทำให้ไฟล์ที่เหลือไม่ได้อัปโหลด — เก็บจำนวนไว้รายงานรวมทีเดียว
          failed++;
        }
      }
      return { ok, failed };
    },
    onSuccess: ({ ok, failed }) => {
      setProgress(null);
      // รีเฟรชเสมอแม้บางไฟล์พลาด เพื่อให้รายการแสดงไฟล์ที่สำเร็จแล้วจริง
      onChanged();
      setError(failed > 0 ? t("indicatorDetail.uploadPartialFailed", { n: failed }) : null);
      if (ok > 0) toast.success(t("toast.attachmentsAdded", { n: ok }));
      if (failed > 0) toast.error(t("indicatorDetail.uploadPartialFailed", { n: failed }));
    },
    onError: () => {
      setProgress(null);
      setError(t("common.error"));
    },
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
        <>
          <input
            type="file"
            multiple
            disabled={uploadFiles.isPending}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) uploadFiles.mutate(files);
              e.target.value = "";
            }}
            className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-tint hover:file:bg-primary-700"
          />
          <p className="mt-1 text-[11px] text-muted">{t("indicatorDetail.multiFileHint")}</p>
        </>
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

      {uploadFiles.isPending && (
        <p className="mt-1 text-xs text-muted">
          {progress && progress.total > 1
            ? t("indicatorDetail.uploadingProgress", { current: progress.current, total: progress.total })
            : t("indicatorDetail.uploading")}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}
