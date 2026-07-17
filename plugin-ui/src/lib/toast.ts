import { createContext, useContext } from "react"

export type ToastVariant = "info" | "success" | "error"

export type ToastInput = string | {
  text: string
  variant?: ToastVariant
}

export type ToastContextValue = {
  toast: (input: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
