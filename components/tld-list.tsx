"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export type TldInfo = {
  extension: string
  firstYearPrice: number
  renewalPrice: number
  registrar: string
}

export async function fetchTlds(limit = 50, offset = 0): Promise<{ tlds: TldInfo[]; total: number; hasMore: boolean }> {
  const res = await fetch(`/api/tlds?limit=${limit}&offset=${offset}`)
  const data = await res.json()
  return data
}

export function TldList({ initialLimit = 20 }: { initialLimit?: number }) {
  const [tlds, setTlds] = useState<TldInfo[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const initialLoaded = useRef(false)

  const loadTlds = useCallback(async (pageNum: number) => {
    if (loading) return
    setLoading(true)
    try {
      const limit = initialLimit
      const data = await fetchTlds(limit, pageNum * limit)
      if (pageNum === 0) {
        setTlds(data.tlds)
        setTotal(data.total)
      } else {
        setTlds((prev) => [...prev, ...data.tlds])
      }
      setHasMore(data.hasMore)
      setPage(pageNum)
    } finally {
      setLoading(false)
    }
  }, [loading, initialLimit])

  useEffect(() => {
    if (initialLoaded.current) return
    initialLoaded.current = true
    loadTlds(0)
  }, [loadTlds])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadTlds(page + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, page, loadTlds])

  const absoluteCheap = tlds.filter((t) => t.firstYearPrice <= 2).length

  if (tlds.length === 0 && !loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load registrar pricing right now. Try again in a minute.
      </p>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} TLDs found · {absoluteCheap} under $2
      </p>
      <div className="mode-panel rounded border border-border bg-background">
        {tlds.map((tld, index) => {
          const renewalKnown = Number.isFinite(tld.renewalPrice) && tld.renewalPrice > 0
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
      <div ref={loadMoreRef} className="mt-4 text-center">
        {loading && <span className="text-muted-foreground">Loading more...</span>}
        {!hasMore && tlds.length > 0 && (
          <span className="text-sm text-muted-foreground">Showing all {total} TLDs</span>
        )}
      </div>
    </div>
  )
}