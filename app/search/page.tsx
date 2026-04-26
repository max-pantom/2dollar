import type { Metadata } from "next"
import Link from "next/link"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { StreamingDomainCard } from "@/components/streaming-domain-card"
import { searchDomainStream } from "@/lib/domain/search"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  if (!query) {
    return {
      title: "search",
      description:
        "Search any idea and find cheap available domains around $2.",
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const { parsed, results } = await searchDomainStream(query)

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
            <p className="text-pretty text-muted-foreground">
              That input could not be turned into a domain. Try a single word or
              a full domain like example.xyz.
            </p>
          ) : null}

          {parsed && results.length === 0 ? (
            <p className="text-pretty text-muted-foreground">
              No results yet. The registrar pricing API may be slow. Try again.
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="mode-panel rounded border border-border bg-background px-3">
              {results.map((result) => (
                <StreamingDomainCard
                  key={result.domain}
                  result={result}
                  query={query}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
