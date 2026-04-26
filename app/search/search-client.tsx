"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { StreamingDomainCard } from "@/components/streaming-domain-card"
import { useStaggeredReveal } from "@/components/staggered-reveal"
import {
  searchDomainStream,
  type ParsedQuery,
  type StreamingDomainResult,
} from "@/lib/domain/search"

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query] = useState(initialQuery)
  const [results, setResults] = useState<StreamingDomainResult[]>([])
  const [parsed, setParsed] = useState<ParsedQuery | null>(null)
  const [absoluteCheapCount, setAbsoluteCheapCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const initialLoaded = useRef(false)

  const { visible: visibleResults } = useStaggeredReveal(results, { stepMs: 60 })

  const loadResults = useCallback(
    async (searchQuery: string, pageNum: number) => {
      if (loading) return
      setLoading(true)
      try {
        const limit = 50
        const stream = await searchDomainStream(
          searchQuery,
          limit + pageNum * limit
        )
        if (pageNum === 0) {
          setParsed(stream.parsed)
          setAbsoluteCheapCount(stream.absoluteCheapCount)
          setResults(stream.results)
        } else {
          setResults((prev) => [...prev, ...stream.results.slice(prev.length)])
        }
        setHasMore(stream.hasMore)
        setPage(pageNum)
      } finally {
        setLoading(false)
      }
    },
    [loading]
  )

  useEffect(() => {
    if (!query) return
    if (initialLoaded.current) return
    initialLoaded.current = true
    loadResults(query, 0)
  }, [query, loadResults])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    loadResults(query, page + 1)
  }, [hasMore, loading, query, page, loadResults])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <section className="space-y-6">
          <div className="mx-auto space-y-2 text-center">
            <div className="flex justify-center">
              <Sticker tone="muted">
              {parsed?.type === "exact" ? "exact check" : "name search"}
              </Sticker>
            </div>
            <h1 className="mode-headline font-mono text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              {query ? query : "type something to search"}
            </h1>
          </div>
          <div className="mx-auto max-w-3xl">
            <SearchBox defaultValue={query} size="default" />
          </div>
        </section>

        <section className="mt-12">
          {!query ? (
            <p className="mx-auto max-w-3xl text-center text-pretty text-muted-foreground">
              Try a single word like{" "}
              <Link
                href="/search?q=studio"
                className="underline underline-offset-4"
              >
                studio
              </Link>{" "}
              or an exact domain like{" "}
              <Link
                href="/search?q=hello.xyz"
                className="underline underline-offset-4"
              >
                hello.xyz
              </Link>
              .
            </p>
          ) : null}

          {query && !parsed ? (
            <p className="mx-auto max-w-3xl text-center text-pretty text-muted-foreground">
              That input could not be turned into a domain. Try a single word or
              a full domain like example.xyz.
            </p>
          ) : null}

          {parsed && results.length === 0 && !loading ? (
            <p className="mx-auto max-w-3xl text-center text-pretty text-muted-foreground">
              No results yet.
            </p>
          ) : null}

          {results.length > 0 ? (
            <>
              {absoluteCheapCount > 0 ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  {absoluteCheapCount} TLDs available for under $2
                </p>
              ) : null}
              <div className="mode-panel rounded border border-border bg-background px-3">
                {visibleResults.map((result) => (
                  <StreamingDomainCard
                    key={result.domain}
                    result={result}
                    query={query}
                  />
                ))}
              </div>
              <div ref={loadMoreRef} className="mt-4 text-center">
                {loading ? (
                  <span className="text-muted-foreground">Loading more...</span>
                ) : null}
                {!hasMore && results.length > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Showing all results
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

