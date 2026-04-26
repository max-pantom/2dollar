"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { SEED_WORDS, pickRandomSeed } from "@/lib/domain/seeds"

export function RandomButtons() {
  const router = useRouter()

  function go(word: string) {
    router.push(`/search?q=${encodeURIComponent(word)}`)
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => go(pickRandomSeed())}>
        surprise me
      </Button>
      <div className="flex flex-wrap gap-2">
        {SEED_WORDS.map((word) => (
          <Button
            key={word}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => go(word)}
          >
            {word}
          </Button>
        ))}
      </div>
    </div>
  )
}
