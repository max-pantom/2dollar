import { DomainCard } from "@/components/domain-card"
import { AvailabilityTag } from "@/components/availability-tag"
import type { DomainResult } from "@/lib/domain/types"

export function ResolvedDomainCard({
  result,
  query,
}: {
  result: DomainResult
  query: string
}) {
  return (
    <DomainCard
      domain={result.domain}
      firstYearPrice={result.firstYearPrice}
      renewalPrice={result.renewalPrice}
      registrar={result.registrar}
      buyUrl={result.buyUrl}
      query={query}
      notes={result.notes}
      isAbsoluteCheap={result.isAbsoluteCheap}
      availabilitySlot={<AvailabilityTag availability={result.availability} />}
    />
  )
}

