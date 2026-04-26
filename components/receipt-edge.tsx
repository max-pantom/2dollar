import { cn } from "@/lib/utils"

export function ReceiptEdge({
  className,
  position = "bottom",
}: {
  className?: string
  position?: "top" | "bottom"
}) {
  return (
    <svg
      role="presentation"
      aria-hidden="true"
      viewBox="0 0 24 8"
      preserveAspectRatio="none"
      className={cn(
        "block h-2 w-full text-background",
        position === "top" && "rotate-180",
        className
      )}
    >
      <polygon
        fill="currentColor"
        stroke="var(--color-border)"
        strokeWidth="0.4"
        points="0,0 24,0 24,4 22,8 20,4 18,8 16,4 14,8 12,4 10,8 8,4 6,8 4,4 2,8 0,4"
      />
    </svg>
  )
}
