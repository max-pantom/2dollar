import type { Metadata } from "next"

import { RandomButtons } from "@/components/random-buttons"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Sticker } from "@/components/sticker"

export const metadata: Metadata = {
  title: "random",
  description:
    "Pick a curated single-word seed and check it against all the cheap TLDs we track.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "random · 2dollardomain",
    description: "Roll a random word, check it against $2-ish TLDs live.",
  },
}

export default function RandomPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <section className="space-y-5">
          <Sticker tone="muted">idea slot machine</Sticker>
          <h1 className="mode-headline max-w-3xl text-5xl font-semibold tracking-tight text-balance">
            give me a name to check.
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Pick a curated single-word seed and we&apos;ll check it against all
            the cheap TLDs we know about. No name generation, just one honest
            word at a time.
          </p>
        </section>

        <section className="mt-10">
          <RandomButtons />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
