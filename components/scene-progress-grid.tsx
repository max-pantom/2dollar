"use client"

import { useEffect, useMemo, useState } from "react"

type Props = {
  boxes?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function SceneProgressGrid({ boxes = 10 }: Props) {
  const [progress, setProgress] = useState(0)

  const safeBoxes = useMemo(() => clamp(Math.floor(boxes), 4, 20), [boxes])

  useEffect(() => {
    let raf = 0

    function compute() {
      const nodes = document.querySelectorAll("[data-availability]")
      const total = nodes.length
      if (total === 0) {
        setProgress(0)
        return
      }

      let resolved = 0
      for (const node of nodes) {
        const value = (node as HTMLElement).dataset.availability
        if (value && value !== "checking") {
          resolved += 1
        }
      }

      setProgress(resolved / total)
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-availability"],
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  const filled = Math.round(progress * safeBoxes)

  return (
    <span
      className="inline-flex items-center gap-1"
      aria-hidden="true"
      title={`${Math.round(progress * 100)}% checks`}
    >
      {Array.from({ length: safeBoxes }).map((_, index) => (
        <span
          key={index}
          className={
            index < filled
              ? "h-2 w-2 bg-foreground"
              : "h-2 w-2 border border-foreground"
          }
        />
      ))}
    </span>
  )
}

