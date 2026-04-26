import { fetchCheapTlds } from "@/lib/registrars/porkbun"

export async function PriceTape() {
  const tlds = await fetchCheapTlds()

  if (tlds.length === 0) {
    return null
  }

  const items = tlds.slice(0, 24)

  return (
    <div
      className="price-tape relative isolate overflow-hidden border-b border-border bg-muted/40 text-xs"
      aria-label="cheap TLD price ticker"
    >
      <div className="price-tape-track flex w-max gap-8 py-2 font-mono whitespace-nowrap">
        {[...items, ...items].map((tld, index) => (
          <span
            key={`${tld.extension}-${index}`}
            className="flex items-center gap-2"
            aria-hidden={index >= items.length || undefined}
          >
            <span className="font-medium">.{tld.extension}</span>
            <span className="text-muted-foreground tabular-nums">
              ${tld.firstYearPrice.toFixed(2)}
            </span>
            <span className="text-muted-foreground">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
