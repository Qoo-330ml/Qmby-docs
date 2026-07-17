export const uiStyles = {
  glassPanel:
    "rounded-xl border border-border/70 bg-card/45 text-card-foreground shadow-[0_8px_24px_rgb(15_23_42_/_0.13)] backdrop-blur",
  glassSubtle:
    "rounded-lg border border-border/70 bg-card/45 shadow-[0_6px_16px_rgb(15_23_42_/_0.09)] backdrop-blur",
  surfaceInset:
    "rounded-lg border border-border/70 bg-background",
  alert:
    "rounded-lg border px-4 py-3 text-sm shadow-[0_8px_20px_rgb(15_23_42_/_0.04)]",
  empty:
    "rounded-lg border border-dashed border-border/80 bg-card p-6 text-center text-sm text-muted-foreground shadow-[0_8px_18px_rgb(15_23_42_/_0.04)]",
  tableWrap:
    "overflow-hidden rounded-lg border border-border/70 bg-card",
  tableHead:
    "border-b bg-muted/45 text-xs text-muted-foreground",
  tableRow:
    "border-b transition-colors last:border-0 hover:bg-muted/25",
  badge:
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium leading-5",
  filterShell:
    "flex min-w-0 items-center gap-1.5",
  segmentShell:
    "inline-flex items-center rounded-lg border border-border/70 bg-card/45 p-0.5 shadow-sm backdrop-blur",
} as const
