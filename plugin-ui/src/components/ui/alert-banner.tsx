import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

const alertBannerVariants = cva(uiStyles.alert, {
  variants: {
    variant: {
      info: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue",
      success: "border-success/30 bg-success/10 text-success",
      warning: "border-warning/30 bg-warning/10 text-warning",
      destructive: "border-destructive/30 bg-destructive/10 text-destructive",
    },
  },
  defaultVariants: { variant: "info" },
})

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} data-ui-slot="alert-banner" className={cn(alertBannerVariants({ variant }), className)} {...props} />
  )
)
AlertBanner.displayName = "AlertBanner"

export { AlertBanner }
