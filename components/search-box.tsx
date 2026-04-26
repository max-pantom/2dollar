"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { pickRandomSeed } from "@/lib/domain/seeds"

const CHIPS = [
  { label: "brand", value: "brand name" },
  { label: "shop", value: "shop" },
  { label: "newsletter", value: "newsletter" },
  { label: "saas", value: "tiny saas" },
] as const

export function SearchBox({
  defaultValue = "",
  size = "lg",
}: {
  defaultValue?: string
  size?: "lg" | "default"
}) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = query.trim()
    if (!value) {
      return
    }
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  function surpriseMe() {
    const seed = pickRandomSeed()
    setQuery(seed)
    router.push(`/search?q=${encodeURIComponent(seed)}`)
  }

  function applyChip(value: string) {
    setQuery(value)
    const input = document.querySelector<HTMLInputElement>("[data-search-input]")
    input?.focus()
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-2 md:flex-row"
      >
        <label className="sr-only" htmlFor="domain-search">
          type an idea, brand, or random thought
        </label>
        <input
          id="domain-search"
          data-search-input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="type an idea, brand, or random thought"
          className="flex-1 rounded border border-foreground bg-background px-4 py-3 font-mono text-base outline-none placeholder:text-muted-foreground focus:bg-muted/40"
          autoComplete="off"
          spellCheck="false"
        />
        <div className="flex gap-2">
          <Button type="submit" size={size}>
            find domains
          </Button>
          <Button
            type="button"
            variant="secondary"
            size={size}
            onClick={surpriseMe}
          >
            surprise me
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => applyChip(chip.value)}
            className="inline-flex items-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}
