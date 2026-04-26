import Link from "next/link"

import { LogoChaos } from "@/components/logo-chaos"
import { ModeToggle } from "@/components/mode-toggle"
import { PriceTape } from "@/components/price-tape"

export function SiteHeader() {
  return (
    <>
      <PriceTape />
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <div className="min-w-0">
            <div className="hidden sm:block">
              <LogoChaos />
            </div>
            <Link
              href="/"
              className="block font-mono text-base font-semibold tracking-tight sm:hidden"
            >
              2dollardomain
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-5">
            <Link href="/drop" className="hover:text-foreground">
              daily drop
            </Link>
            <Link
              href="/random"
              className="hidden hover:text-foreground sm:inline-flex"
            >
              random
            </Link>
            <span
              aria-hidden="true"
              className="hidden font-mono text-xs text-muted-foreground lg:inline-flex"
            >
              <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px]">
                /
              </kbd>
              <span className="ml-1.5">to search</span>
            </span>
            <ModeToggle />
          </nav>
        </div>
      </header>
    </>
  )
}
