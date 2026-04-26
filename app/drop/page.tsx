import type { Metadata } from "next"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { TldList } from "@/components/tld-list"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "daily drop",
  description:
    "Today's $2-ish TLDs. Real-time pricing from Porkbun, capped at $2.50, sorted by first-year price.",
  alternates: { canonical: "/drop" },
  openGraph: {
    title: "daily drop · 2dollardomain",
    description: "Today's $2-ish TLDs. Real Porkbun pricing.",
  },
}

export default function DropPage() {
  const date = new Date().toISOString().slice(0, 10)

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <section className="space-y-5">
          <Sticker tone="deal">daily drop · {date}</Sticker>
          <h1 className="mode-headline max-w-3xl text-5xl font-semibold tracking-tight text-balance">
            today&apos;s $2-ish TLDs.
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            A real-time price list pulled from the Porkbun public pricing API.
            Sorted by first-year price, capped at $2.50.
          </p>
        </section>

        <section className="mt-12 space-y-5">
          <TldList limit={20} />
        </section>

        <section className="mt-16 space-y-3">
          <h2 className="text-lg font-semibold">try a name on these</h2>
          <SearchBox size="default" />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
