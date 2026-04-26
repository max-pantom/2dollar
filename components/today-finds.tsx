import { StreamingDomainCard } from "@/components/streaming-domain-card"
import { getTodayFindsStream } from "@/lib/domain/today"

export async function TodayFinds() {
  const finds = await getTodayFindsStream(6)

  if (finds.length === 0) {
    return (
      <p className="rounded border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
        Today&apos;s finds are warming up. Try a search above.
      </p>
    )
  }

  return (
    <div className="mode-panel rounded border border-border bg-background px-3">
      {finds.map((result) => (
        <StreamingDomainCard
          key={result.domain}
          result={result}
          query="today's finds"
        />
      ))}
    </div>
  )
}
