import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { ToastContext, type ToastInput, type ToastVariant } from "../../lib/toast"
import { cn } from "../../lib/utils"

type ToastItem = {
  id: number
  text: string
  variant: ToastVariant
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)
  const nextID = useRef(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  const remove = useCallback((id: number) => {
    setItems(current => current.filter(item => item.id !== id))
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const text = typeof input === "string" ? input : input.text
    if (!text) return

    const id = nextID.current
    nextID.current += 1
    const variant = typeof input === "string" ? "info" : input.variant || "info"
    setItems(current => [...current.slice(-3), { id, text, variant }])
    window.setTimeout(() => remove(id), 3600)
  }, [remove])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted && createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[2147483647] flex flex-col items-center gap-2 px-4">
          {items.map(item => (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-[min(520px,calc(100vw-2rem))] items-start gap-3 rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-[0_12px_36px_rgb(15_23_42_/_0.18)]",
                item.variant === "success" && "border-success/35 text-success",
                item.variant === "error" && "border-destructive/35 text-destructive"
              )}
              role="status"
            >
              <span className="min-w-0 flex-1">{item.text}</span>
              <button
                type="button"
                className="mt-0.5 rounded-full p-1 text-muted-foreground hover:bg-muted"
                onClick={() => remove(item.id)}
                aria-label="关闭提示"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
