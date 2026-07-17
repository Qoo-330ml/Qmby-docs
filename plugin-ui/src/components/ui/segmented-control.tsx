import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

interface SegmentedControlOption<T extends string> {
  value: T
  label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentedControlOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div data-ui-slot="segmented-control" className={cn(uiStyles.segmentShell, className)}>
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-[background-color,color,box-shadow]",
              active
                ? "bg-primary text-primary-foreground shadow-[0_8px_18px_rgb(14_165_233_/_0.20)]"
                : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
