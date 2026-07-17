import * as React from "react"
import { cn } from "../../lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label data-ui-slot="switch" className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          ref={ref}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div data-ui-slot="switch-track" className="w-9 h-5 bg-slate-300 shadow-inner rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:shadow-sm after:rounded-full after:h-4 after:w-4 after:transition-all dark:bg-slate-600" />
      </label>
    )
  }
)
Switch.displayName = "Switch"
export { Switch }
