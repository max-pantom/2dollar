import Link from "next/link"

import { ReceiptEdge } from "@/components/receipt-edge"
import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"
import { TldList } from "@/components/tld-list"
import { TodayFinds } from "@/components/today-finds"

export const revalidate = 3600

export default function Page() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24">
        <section className="space-y-8">
          <div className="space-y-5">
            <h1 className="mode-headline max-w-3xl text-5xl font-semibold tracking-tight text-balance md:text-6xl">
              find the domain before
              <br className="hidden md:block" />
              the motivation leaves.
            </h1>
            <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
              Search any idea and find cheap available domains around $2.
              Serious ideas, joke projects, tiny SaaS, creator brands,
              newsletters, weekend builds.
            </p>
          </div>
          <SearchBox />
          <p className="text-pretty text-muted-foreground">
            We check availability live via RDAP and show real Porkbun pricing.
            Renewal price is always shown because cheap today can be spicy
            later.
          </p>
        </section>

        <section className="mt-20 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <Sticker tone="deal">today&apos;s $2-ish finds</Sticker>
              <h2 className="mode-headline text-2xl font-semibold tracking-tight">
                random names checked live
              </h2>
            </div>
            <Link
              href="/random"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              roll again &rarr;
            </Link>
          </div>
          <TodayFinds />
          <ReceiptEdge />
        </section>

        <section className="mt-16 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <Sticker tone="muted">price index</Sticker>
              <h2 className="mode-headline text-2xl font-semibold tracking-tight">
                cheap TLDs right now
              </h2>
            </div>
            <Link
              href="/drop"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              full daily drop &rarr;
            </Link>
          </div>
          <TldList limit={8} />
          <ReceiptEdge />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
