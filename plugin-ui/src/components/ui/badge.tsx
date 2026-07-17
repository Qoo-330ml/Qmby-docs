import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

const badgeVariants = cva(uiStyles.badge, {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground",
      primary: "bg-primary/10 text-primary",
      teal: "bg-brand-teal/10 text-brand-teal",
      blue: "bg-brand-blue/10 text-brand-blue",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      destructive: "bg-destructive/10 text-destructive",
      outline: "border border-border/70 bg-card/35 text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} data-ui-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
)
Badge.displayName = "Badge"

// eslint-disable-next-line react-refresh/only-export-components -- consumers reuse the variant contract
export { Badge, badgeVariants }
