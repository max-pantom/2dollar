"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Metadata } from "next"
import Link from "next/link"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { StreamingDomainCard } from "@/components/streaming-domain-card"
import { searchDomainStream, type StreamingDomainResult, type ParsedQuery } from "@/lib/domain/search"

export const dynamic = "force-dynamic"

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  const query = searchParams.q?.trim() ?? ""

  if (!query) {
    return {
      title: "search",
      description: "Search any idea and find cheap available domains around $2.",
    }
  }

  return {
    title: `search · ${query}`,
    description: `Cheap available domains for "${query}". Live availability, renewal price always shown.`,
    alternates: {
      canonical: `/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      title: `search · ${query}`,
      description: `Cheap available domains for "${query}".`,
    },
    twitter: {
      card: "summary_large_image",
      title: `search · ${query}`,
      description: `Cheap available domains for "${query}".`,
    },
  }
}

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StreamingDomainResult[]>([])
  const [parsed, setParsed] = useState<ParsedQuery | null>(null)
  const [absoluteCheapCount, setAbsoluteCheapCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const initialLoaded = useRef(false)

  useEffect(() => {
    searchParams.then(({ q }) => {
      const qValue = q?.trim() ?? ""
      setQuery(qValue)
      if (qValue && !initialLoaded.current) {
        initialLoaded.current = true
        loadResults(qValue, 0, true)
      }
    })
  }, [searchParams])

  async function loadResults(searchQuery: string, pageNum: number, replace = false) {
    if (loading) return
    setLoading(true)
    try {
      const limit = 50
      const stream = await searchDomainStream(searchQuery, limit + pageNum * limit)
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
  }

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    loadResults(query, page + 1)
  }, [hasMore, loading, query, page])

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
          <div className="space-y-2">
            <Sticker tone="muted">
              {parsed?.type === "exact" ? "exact check" : "name search"}
            </Sticker>
            <h1 className="mode-headline font-mono text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              {query ? query : "type something to search"}
            </h1>
          </div>
          <SearchBox defaultValue={query} size="default" />
        </section>

        <section className="mt-12">
          {!query ? (
            <p className="text-pretty text-muted-foreground">
              Try a single word like{" "}
              <Link href="/search?q=studio" className="underline underline-offset-4">
                studio
              </Link>{" "}
              or an exact domain like{" "}
              <Link href="/search?q=hello.xyz" className="underline underline-offset-4">
                hello.xyz
              </Link>
              .
            </p>
          ) : null}

          {query && !parsed ? (
            <p className="text-pretty text-muted-foreground">
              That input could not be turned into a domain. Try a single word or a full domain like example.xyz.
            </p>
          ) : null}

          {parsed && results.length === 0 && !loading ? (
            <p className="text-pretty text-muted-foreground">No results yet.</p>
          ) : null}

          {results.length > 0 ? (
            <>
              {absoluteCheapCount > 0 && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {absoluteCheapCount} TLDs available for under $2
                </p>
              )}
              <div className="mode-panel rounded border border-border bg-background px-3">
                {results.map((result) => (
                  <StreamingDomainCard key={result.domain} result={result} query={query} />
                ))}
              </div>
              <div ref={loadMoreRef} className="mt-4 text-center">
                {loading && <span className="text-muted-foreground">Loading more...</span>}
                {!hasMore && results.length > 0 && (
                  <span className="text-sm text-muted-foreground">Showing all results</span>
                )}
              </div>
            </>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}