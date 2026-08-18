import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../features/auth/authContext";

interface NotificationDto {
  id: string;
  action: "submit" | "approve" | "revise" | "comment";
  createdAt: string;
  reviewer: { name: string };
  evidence: { indicator: { code: string; nameTh: string; nameEn: string } };
}

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isThai = i18n.language?.startsWith("th");
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await apiClient.get<NotificationDto[]>("/notifications")).data,
    enabled: user?.role === "teacher" || user?.role === "qa",
    refetchInterval: 60_000,
  });

  if (user?.role !== "teacher" && user?.role !== "qa") return null;

  const items = data ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notifications.title")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface-alt hover:text-ink"
      >
        <Bell className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] font-semibold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-border bg-surface p-2 shadow-lg">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t("notifications.title")}
            </p>
            {items.length === 0 && <p className="px-2 py-3 text-sm text-muted">{t("notifications.empty")}</p>}
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="rounded-md px-2 py-2 text-xs hover:bg-surface-alt">
                  <p className="text-ink">
                    {t(`notifications.${n.action}`)} — {n.evidence.indicator.code}{" "}
                    {isThai ? n.evidence.indicator.nameTh : n.evidence.indicator.nameEn}
                  </p>
                  <p className="mt-0.5 text-muted">
                    {n.reviewer.name} · {new Date(n.createdAt).toLocaleString(isThai ? "th-TH" : "en-US")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
