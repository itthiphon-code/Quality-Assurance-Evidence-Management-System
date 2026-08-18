import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../lib/apiClient";
import { openAttachment } from "../../lib/attachments";

interface AttachmentSummary {
  id: string;
  type: "file" | "drive_link";
  filename: string;
}

interface EvidenceItemSummary {
  id: string;
  descriptionTh: string;
  descriptionEn: string;
  attachments: AttachmentSummary[];
}

interface IndicatorFolder {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  visitMethod: string;
  collectionMethods: { id: string; name: string }[];
  dataSources: { id: string; name: string }[];
  evidenceItems: EvidenceItemSummary[];
}

interface StandardFolder {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  indicators: IndicatorFolder[];
}

export function AssessorFolderPage() {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith("th");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["assessor", "folder"],
    queryFn: async () => (await apiClient.get<StandardFolder[]>("/assessor/folder")).data,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold text-ink">{t("assessorFolder.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("assessorFolder.subtitle")}</p>

      {isLoading && <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>}
      {isError && <p className="mt-4 text-sm text-status-danger">{t("common.error")}</p>}

      <div className="mt-6 space-y-6">
        {data?.map((standard) => (
          <section key={standard.id}>
            <h2 className="mb-3 font-semibold text-primary-700 dark:text-primary">
              {standard.code} — {isThai ? standard.nameTh : standard.nameEn}
            </h2>
            <div className="space-y-3">
              {standard.indicators.map((ind) => (
                <div key={ind.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium text-ink">
                      {ind.code} — {isThai ? ind.nameTh : ind.nameEn}
                    </h3>
                    <span className="text-xs text-muted">
                      {t("assessorFolder.visitMethod")}: {ind.visitMethod}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                    {ind.collectionMethods.length > 0 && (
                      <span>
                        {t("indicatorDetail.collectionMethods")}: {ind.collectionMethods.map((m) => m.name).join(", ")}
                      </span>
                    )}
                    {ind.dataSources.length > 0 && (
                      <span>
                        {t("indicatorDetail.dataSources")}: {ind.dataSources.map((s) => s.name).join(", ")}
                      </span>
                    )}
                  </div>

                  {ind.evidenceItems.length === 0 ? (
                    <p className="mt-3 text-xs text-muted">{t("assessorFolder.empty")}</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {ind.evidenceItems.map((ev) => (
                        <li key={ev.id} className="rounded-lg bg-surface-alt p-3">
                          <p className="text-sm text-ink">{isThai ? ev.descriptionTh : ev.descriptionEn}</p>
                          <ul className="mt-2 space-y-1">
                            {ev.attachments.map((att) => (
                              <li key={att.id} className="flex items-center justify-between text-xs">
                                <span className="truncate">
                                  {att.type === "drive_link" ? "🔗" : "📄"} {att.filename}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openAttachment(att.id)}
                                  className="shrink-0 text-primary-700 underline dark:text-primary"
                                >
                                  {t("indicatorDetail.open")}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
