export const KPI_ICON_NAMES = [
  "dollar",
  "flame",
  "trendingUp",
  "fileWarning",
  "wallet",
  "lineChart",
] as const;

export type KpiIconName = (typeof KPI_ICON_NAMES)[number];
