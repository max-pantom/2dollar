"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { pickRandomSeed } from "@/lib/domain/seeds"

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === "Escape") {
        const active = document.activeElement
        if (active instanceof HTMLElement) {
          active.blur()
        }
        const search = document.querySelector<HTMLInputElement>(
          "[data-search-input]"
        )
        if (search && search === document.activeElement) {
          search.value = ""
          search.dispatchEvent(new Event("input", { bubbles: true }))
        }
        return
      }

      if (isTypingTarget(event.target)) return

      if (event.key === "/") {
        const search = document.querySelector<HTMLInputElement>(
          "[data-search-input]"
        )
        if (search) {
          event.preventDefault()
          search.focus()
          search.select()
        }
        return
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault()
        const seed = pickRandomSeed()
        router.push(`/search?q=${encodeURIComponent(seed)}`)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  return null
}
