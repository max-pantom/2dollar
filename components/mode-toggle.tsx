"use client"

import { useMode } from "@/components/mode-provider"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { mode, setMode } = useMode()

  return (
    <div
      role="group"
      aria-label="visual mode"
      className="inline-flex items-center overflow-hidden rounded border border-border bg-muted/40 p-0.5 font-mono text-[10px] tracking-widest uppercase"
    >
      <button
        type="button"
        aria-pressed={mode === "calm"}
        onClick={() => setMode("calm")}
        className={cn(
          "rounded-sm px-2.5 py-1 transition-colors",
          mode === "calm"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        calm
      </button>
      <button
        type="button"
        aria-pressed={mode === "scene"}
        onClick={() => setMode("scene")}
        className={cn(
          "rounded-sm px-2.5 py-1 transition-colors",
          mode === "scene"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        scene
      </button>
    </div>
  )
}
