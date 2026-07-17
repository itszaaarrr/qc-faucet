"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      className="toaster group"
      toastOptions={{
        style: {
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          fontSize: "13px",
        },
        classNames: {
          description: "group-[.toast]:text-[var(--text-secondary)]",
          actionButton:
            "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[var(--border-default)] group-[.toast]:text-[var(--text-secondary)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
