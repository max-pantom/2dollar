import { use } from "react"

import type { Availability } from "@/lib/domain/rdap"
import { cn } from "@/lib/utils"

export function AvailabilityTag({
  availability,
}: {
  availability: Availability
}) {
  return (
    <span
      data-availability={availability}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        availability === "available" && "text-accent",
        availability === "taken" && "text-muted-foreground",
        availability === "unknown" && "text-warning"
      )}
    >
      <span
        className={cn(
          "inline-block size-2 rounded-full",
          availability === "available" && "bg-accent",
          availability === "taken" && "bg-muted-foreground",
          availability === "unknown" && "bg-warning"
        )}
      />
      {availability === "available" && "available"}
      {availability === "taken" && "taken"}
      {availability === "unknown" && "unknown"}
    </span>
  )
}

export function AvailabilityChecking() {
  return (
    <span
      data-availability="checking"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
    >
      <span className="checking-dot inline-block size-2 rounded-full bg-muted-foreground" />
      checking
    </span>
  )
}

export function AvailabilityResolver({
  promise,
}: {
  promise: Promise<Availability>
}) {
  const availability = use(promise)
  return <AvailabilityTag availability={availability} />
}
