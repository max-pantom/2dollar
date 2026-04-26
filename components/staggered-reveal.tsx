"use client"

import { useEffect, useRef, useState } from "react"

export function useStaggeredReveal<T>(items: T[], options?: { stepMs?: number }) {
  const stepMs = options?.stepMs ?? 70
  const [visibleCount, setVisibleCount] = useState(items.length)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const target = items.length
    if (visibleCount >= target) return

    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setVisibleCount((c) => {
        if (c + 1 >= target) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        return Math.min(target, c + 1)
      })
    }, stepMs)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [items.length, stepMs, visibleCount])

  return {
    visible: items.slice(0, visibleCount),
    visibleCount,
  }
}

