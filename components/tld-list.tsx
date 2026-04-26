import { fetchCheapTlds } from "@/lib/registrars/porkbun"

export async function TldList({ limit = 8 }: { limit?: number }) {
  const tlds = await fetchCheapTlds()
  const visible = tlds.slice(0, limit)

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load registrar pricing right now. Try again in a minute.
      </p>
    )
  }

  return (
    <div className="mode-panel rounded border border-border bg-background">
      {visible.map((tld, index) => {
        const renewalKnown =
          Number.isFinite(tld.renewalPrice) && tld.renewalPrice > 0
        return (
          <div
            key={tld.extension}
            className={
              "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3 font-mono text-sm" +
              (index > 0 ? " border-t border-border" : "")
            }
          >
            <span className="font-medium">.{tld.extension}</span>
            <span className="tabular-nums">
              <span className="text-muted-foreground">first year </span>
              <span className="font-medium">
                ${tld.firstYearPrice.toFixed(2)}
              </span>
            </span>
            <span className="tabular-nums">
              <span className="text-muted-foreground">renews </span>
              {renewalKnown ? (
                <span className="font-medium">
                  ${tld.renewalPrice.toFixed(2)}/year
                </span>
              ) : (
                <span className="text-muted-foreground">unknown</span>
              )}
            </span>
            <span className="text-muted-foreground">via porkbun</span>
          </div>
        )
      })}
    </div>
  )
}
