"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { pickRandomSeed } from "@/lib/domain/seeds"

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

  return (
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
  )
}
