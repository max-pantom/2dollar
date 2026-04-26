import { cn } from "@/lib/utils"

export function Sticker({
  children,
  tone = "deal",
  className,
}: {
  children: React.ReactNode
  tone?: "deal" | "warning" | "muted"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tone === "deal" && "border-accent bg-accent-soft text-accent",
        tone === "warning" && "border-warning text-warning",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}
