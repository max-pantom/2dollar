"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

export function MobileSearchDock() {
  const router = useRouter()
  const [value, setValue] = useState("")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const v = value.trim()
    if (!v) return
    router.push(`/search?q=${encodeURIComponent(v)}`)
    setValue("")
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      role="search"
    >
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="search a name…"
          className="min-w-0 flex-1 rounded border border-border bg-muted/40 px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus:bg-background"
          autoComplete="off"
          spellCheck="false"
          aria-label="search a domain"
          enterKeyHint="search"
        />
        <button
          type="submit"
          className="rounded bg-foreground px-3 py-2 font-mono text-sm text-background"
        >
          go
        </button>
      </form>
    </div>
  )
}
