import type { Metadata } from "next"
import Link from "next/link"

import { SearchBox } from "@/components/search-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"

export const metadata: Metadata = {
  title: "void receipt · 404",
  description: "This page was never printed.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section className="relative overflow-hidden rounded border border-foreground bg-background px-6 py-10 md:px-10 md:py-14">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 font-mono text-7xl font-bold tracking-widest text-accent/20 select-none md:text-9xl"
          >
            VOID
          </span>

          <div className="relative space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>2dollardomain</span>
              <span>receipt #404</span>
            </div>
            <div className="border-t border-dashed border-border" />

            <div className="flex justify-center">
              <Sticker tone="warning">void</Sticker>
            </div>
            <h1 className="mode-headline text-center font-mono text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              this page was never printed.
            </h1>
            <p className="mx-auto max-w-2xl text-center text-pretty text-muted-foreground">
              No domain, no drop, no dice. Maybe the link expired with the
              motivation. Run a fresh search and let&apos;s find you a real one.
            </p>

            <div className="border-t border-dashed border-border" />
            <div className="mx-auto max-w-3xl">
              <SearchBox size="default" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
              <span>void where prohibited.</span>
              <Link
                href="/"
                className="text-foreground underline underline-offset-4"
              >
                back to home
              </Link>
              <Link
                href="/drop"
                className="text-foreground underline underline-offset-4"
              >
                today&apos;s drop
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
