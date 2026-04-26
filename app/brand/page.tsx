"use client"

import { useState, useRef, useCallback } from "react"

type Point = {
  x: number
  y: number
}

type Path = {
  id: string
  points: Point[]
}

export default function BrandPage() {
  const [paths, setPaths] = useState<Path[]>([])
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setCurrentPath([...currentPath, { x, y }])
    },
    [isDrawing, currentPath]
  )

  const handlePointerUp = () => {
    if (currentPath.length > 1) {
      setPaths([...paths, { id: Date.now().toString(), points: currentPath }])
    }
    setCurrentPath([])
    setIsDrawing(false)
  }

  const undo = () => {
    setPaths(paths.slice(0, -1))
  }

  const clear = () => {
    setPaths([])
    setCurrentPath([])
  }

  const exportSVG = () => {
    if (!svgRef.current) return
    const svg = svgRef.current.cloneNode(true) as SVGSVGElement
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    const bbox = svg.getBBox()
    if (bbox.width && bbox.height) {
      svg.setAttribute(
        "viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
      )
    }
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "brand-drawing.svg"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Brand</h1>
            <div className="font-mono text-xs text-muted-foreground">
              Try{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href="/brand/2"
              >
                /brand/2
              </a>{" "}
              for GlyphMix wordmarks.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={paths.length === 0}
              className="rounded border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={clear}
              disabled={paths.length === 0}
              className="rounded border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={exportSVG}
              disabled={paths.length === 0}
              className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-80 disabled:opacity-50"
            >
              Export SVG
            </button>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Click and drag to draw • Release to save path • Export as SVG
        </div>

        <div className="relative overflow-hidden rounded border border-border bg-muted/20">
          <svg
            ref={svgRef}
            className="h-[600px] w-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {paths.map((path) => (
              <polyline
                key={path.id}
                points={path.points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath.length > 0 && (
              <polyline
                points={currentPath.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
