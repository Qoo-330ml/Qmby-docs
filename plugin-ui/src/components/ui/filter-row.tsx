import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

export type FilterOption = {
  value: string
  label: ReactNode
  activeClass?: string
}

type HighlightStyle = {
  x: number
  width: number
}

interface FilterRowProps {
  icon?: ReactNode
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  highlightClass?: string
  className?: string
}

export function FilterRow({ icon, options, value, onChange, highlightClass, className }: FilterRowProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [highlight, setHighlight] = useState<HighlightStyle | null>(null)
  const activeValue = options.some(option => option.value === value) ? value : ""
  const activeOption = options.find(option => option.value === activeValue)

  const updateHighlight = useCallback(() => {
    const el = itemRefs.current[activeValue]
    if (!el) return
    const next = { x: el.offsetLeft, width: el.offsetWidth }
    setHighlight(prev => prev && prev.x === next.x && prev.width === next.width ? prev : next)
  }, [activeValue])

  useEffect(() => {
    updateHighlight()
    window.addEventListener("resize", updateHighlight)
    return () => window.removeEventListener("resize", updateHighlight)
  }, [options, updateHighlight])

  return (
    <div data-ui-slot="filter-row" className={cn(uiStyles.filterShell, className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="relative min-w-0 flex-1 overflow-x-auto pb-1 -mb-1">
        <div className="relative flex w-max items-center gap-1.5">
          {highlight && (
            <div
              className={cn(
                "pointer-events-none absolute left-0 top-0 h-7 rounded-full transition-[transform,width] duration-700 ease-[cubic-bezier(0.2,1.25,0.35,1)]",
                highlightClass || activeOption?.activeClass || "bg-primary/10"
              )}
              style={{ transform: `translateX(${highlight.x}px)`, width: highlight.width }}
            />
          )}
          {options.map(option => {
            const isActive = option.value === activeValue
            return (
              <button
                key={option.value}
                ref={el => { itemRefs.current[option.value] = el }}
                type="button"
                onClick={() => onChange(value === option.value ? "" : option.value)}
                className={cn(
                  "relative z-10 flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs transition-colors",
                  isActive
                    ? "border-transparent text-foreground"
                    : "border-border/70 text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
