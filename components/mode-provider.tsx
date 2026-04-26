"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react"

export type SiteMode = "calm" | "scene"

const STORAGE_KEY = "2dd-mode"

type Ctx = {
  mode: SiteMode
  setMode: (next: SiteMode) => void
  toggle: () => void
}

const ModeContext = createContext<Ctx | null>(null)

const bootScript = `
(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var mode = stored === 'scene' ? 'scene' : 'calm';
    document.documentElement.dataset.mode = mode;
  } catch (e) {
    document.documentElement.dataset.mode = 'calm';
  }
})();
`

export function ModeBoot() {
  return <script dangerouslySetInnerHTML={{ __html: bootScript }} />
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  })
  return () => observer.disconnect()
}

function getSnapshot(): SiteMode {
  const value = document.documentElement.dataset.mode
  return value === "scene" ? "scene" : "calm"
}

function getServerSnapshot(): SiteMode {
  return "calm"
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setMode = useCallback((next: SiteMode) => {
    document.documentElement.dataset.mode = next
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setMode(mode === "scene" ? "calm" : "scene")
  }, [mode, setMode])

  return (
    <ModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) {
    throw new Error("useMode must be used inside ModeProvider")
  }
  return ctx
}
