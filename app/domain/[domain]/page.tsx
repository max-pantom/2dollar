import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { StreamingDomainCard } from "@/components/streaming-domain-card"
import { searchDomainStream } from "@/lib/domain/search"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const { domain } = await params
  const decoded = decodeURIComponent(domain).toLowerCase()

  return {
    title: decoded,
    description: `Check ${decoded} availability, first year price, and renewal price. Live RDAP availability with real Porkbun pricing.`,
    alternates: {
      canonical: `/domain/${decoded}`,
    },
    openGraph: {
      title: decoded,
      description: `Live availability and renewal price for ${decoded}.`,
      url: `/domain/${decoded}`,
    },
    twitter: {
      card: "summary_large_image",
      title: decoded,
      description: `Live availability and renewal price for ${decoded}.`,
    },
  }
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const decoded = decodeURIComponent(domain).toLowerCase()

  if (!decoded.includes(".")) {
    notFound()
  }

  const { parsed, results } = await searchDomainStream(decoded)

  if (!parsed || results.length === 0) {
    notFound()
  }

  const detail = results[0]
  const sld = parsed.type === "exact" ? parsed.sld : ""

  const alternates = sld
    ? (await searchDomainStream(sld)).results.filter(
        (item) => item.domain !== detail.domain
      )
    : []

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <section className="space-y-5">
          <Sticker tone="muted">domain detail</Sticker>
          <h1 className="mode-headline font-mono text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {detail.domain}
          </h1>
          <SearchBox defaultValue={sld || detail.domain} size="default" />
        </section>

        <section className="mode-panel mt-10 rounded border border-border bg-background px-3">
          <StreamingDomainCard
            result={detail}
            query={sld || detail.domain}
            defaultOpen
          />
        </section>

        {alternates.length > 0 ? (
          <section className="mt-16 space-y-4">
            <h2 className="text-lg font-semibold">other TLDs for {sld}</h2>
            <div className="mode-panel rounded border border-border bg-background px-3">
              {alternates.map((item) => (
                <StreamingDomainCard
                  key={item.domain}
                  result={item}
                  query={sld}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}
