import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import type { IndicatorReadiness } from "../components/IndicatorReadinessTable";

interface StatusCounts {
  todo: number;
  progress: number;
  review: number;
  approved: number;
  revise: number;
  total: number;
}

interface StandardCounts extends StatusCounts {
  standardId: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface DashboardSummary {
  overall: StatusCounts;
  byStandard: StandardCounts[];
  byIndicator: IndicatorReadiness[];
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => (await apiClient.get<DashboardSummary>("/dashboard/summary")).data,
  });
}
