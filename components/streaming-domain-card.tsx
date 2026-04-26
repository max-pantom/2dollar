import { Suspense } from "react"

import {
  AvailabilityChecking,
  AvailabilityResolver,
} from "@/components/availability-tag"
import { DomainCard } from "@/components/domain-card"
import type { StreamingDomainResult } from "@/lib/domain/search"

export function StreamingDomainCard({
  result,
  query,
  defaultOpen,
}: {
  result: StreamingDomainResult
  query?: string
  defaultOpen?: boolean
}) {
  return (
    <DomainCard
      domain={result.domain}
      firstYearPrice={result.firstYearPrice}
      renewalPrice={result.renewalPrice}
      registrar={result.registrar}
      buyUrl={result.buyUrl}
      notes={result.notes}
      query={query}
      defaultOpen={defaultOpen}
      isAbsoluteCheap={result.isAbsoluteCheap}
      availabilitySlot={
        <Suspense fallback={<AvailabilityChecking />}>
          <AvailabilityResolver promise={result.availability} />
        </Suspense>
      }
    />
  )
}
