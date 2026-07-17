import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div data-ui-slot="empty-state" className={cn(uiStyles.empty, "flex flex-col items-center justify-center", className)}>
      {icon && <div className="mb-3 text-muted-foreground/25 [&_svg]:h-10 [&_svg]:w-10">{icon}</div>}
      <p>{title}</p>
      {description && <p className="mt-1 text-xs">{description}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
