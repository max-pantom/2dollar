"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { useMode } from "@/components/mode-provider"

type InventedStyle = "clean" | "sticker" | "wire" | "melt" | "pixel"

type Letter = {
  id: string
  char: string
  fontFamily: string
  fontWeight: number
  fontSize: number
  rotate: number
  scaleX: number
  scaleY: number
  skewX: number
  baseline: number
  fill: string
  strokeWidth: number
  invented: InventedStyle
  tracking: number
}

const WORD = "2dollardomain"

const PALETTE = {
  ink: "#0F0F0F",
  red: "#E11D48",
  yellow: "#FFE600",
}

const FONTS = [
  "var(--font-sans), ui-sans-serif, system-ui",
  "var(--font-mono), ui-monospace, SFMono-Regular",
  "ui-serif, Georgia, Times, serif",
] as const

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function jitter(rand: () => number, range: number) {
  return (rand() - 0.5) * 2 * range
}

function pick<T>(rand: () => number, items: readonly T[]) {
  return items[Math.floor(rand() * items.length)]
}

function makeLetters(seed: number): Letter[] {
  const rand = mulberry32(seed >>> 0)
  const chars = Array.from(WORD)

  return chars.map((char, index) => {
    const invented = pick(rand, ["clean", "sticker", "wire", "melt", "pixel"] as const)
    const fontFamily = pick(rand, FONTS)
    const fontSize = clamp(Math.round(16 + jitter(rand, 3.5)), 12, 24)
    const fill = rand() < 0.22 ? PALETTE.red : PALETTE.ink

    return {
      id: `${index}-${char}-${Math.floor(rand() * 1e9)}`,
      char,
      fontFamily,
      fontWeight: clamp(Math.round(520 + jitter(rand, 260)), 300, 900),
      fontSize,
      rotate: jitter(rand, 8),
      scaleX: clamp(1 + jitter(rand, 0.18), 0.75, 1.35),
      scaleY: clamp(1 + jitter(rand, 0.14), 0.8, 1.28),
      skewX: jitter(rand, 10),
      baseline: Math.round(jitter(rand, 3)),
      fill,
      strokeWidth: clamp(Number((0.8 + rand() * 1.0).toFixed(2)), 0.5, 2),
      invented,
      tracking: clamp(Math.round(jitter(rand, 2)), -2, 6),
    }
  })
}

function filterFor(style: InventedStyle) {
  if (style === "melt") return "logo-melt"
  if (style === "pixel") return "logo-pixel"
  return null
}

export function LogoChaos() {
  const { mode } = useMode()
  const stableSeed = useMemo(() => hashSeed(WORD), [])
  const [seed, setSeed] = useState(() => stableSeed)
  const svgRef = useRef<SVGSVGElement>(null)

  // update every 2 seconds in scene mode
  useEffect(() => {
    if (mode !== "scene") return
    const id = window.setInterval(() => {
      setSeed((s) => (s + 1) >>> 0)
    }, 2000)
    return () => window.clearInterval(id)
  }, [mode])

  // calm mode uses stable seed
  useEffect(() => {
    if (mode !== "calm") return
    const id = window.setTimeout(() => {
      setSeed(stableSeed)
    }, 0)
    return () => window.clearTimeout(id)
  }, [mode, stableSeed])

  const letters = useMemo(() => makeLetters(seed), [seed])

  const layout = useMemo(() => {
    const y = 18
    const positions = letters.reduce<{ x: number; y: number }[]>((acc) => {
      const prevX = acc.length === 0 ? 0 : acc[acc.length - 1].x
      const prev = letters[acc.length - 1]
      const prevW = prev ? prev.fontSize * 0.6 * prev.scaleX : 0
      const x = acc.length === 0 ? 0 : prevX + prevW + 2 + prev.tracking
      return [...acc, { x, y }]
    }, [])
    const last = letters[letters.length - 1]
    const lastX = positions.length ? positions[positions.length - 1].x : 0
    const width = last ? Math.max(120, lastX + last.fontSize * 0.9 + 2) : 140
    return { positions, width, height: 28 }
  }, [letters])

  return (
    <Link href="/" aria-label="2dollardomain" className="block">
      <svg
        ref={svgRef}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <filter id="logo-melt" x="-30%" y="-60%" width="160%" height="220%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="1"
              seed="3"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <filter id="logo-pixel" x="-20%" y="-20%" width="140%" height="140%">
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 0.35 0.7 1" />
              <feFuncG type="discrete" tableValues="0 0.35 0.7 1" />
              <feFuncB type="discrete" tableValues="0 0.35 0.7 1" />
            </feComponentTransfer>
          </filter>
        </defs>

        {letters.map((l, index) => {
          const p = layout.positions[index]
          const transform = `translate(${p.x},${p.y + l.baseline}) rotate(${l.rotate}) skewX(${l.skewX}) scale(${l.scaleX},${l.scaleY})`
          const filter = filterFor(l.invented)

          return (
            <g key={l.id} transform={transform}>
              <text
                x={0}
                y={0}
                fontFamily={l.fontFamily}
                fontSize={l.fontSize}
                fontWeight={l.fontWeight}
                fill={l.invented === "wire" ? "transparent" : l.fill}
                stroke={l.invented === "wire" ? PALETTE.ink : PALETTE.ink}
                strokeWidth={l.strokeWidth}
                strokeLinejoin="round"
                paintOrder="stroke fill"
                filter={filter ? `url(#${filter})` : undefined}
              >
                {l.char}
              </text>
              {l.invented === "sticker" ? (
                <text
                  x={1.2}
                  y={1.2}
                  fontFamily={l.fontFamily}
                  fontSize={l.fontSize}
                  fontWeight={l.fontWeight}
                  fill={PALETTE.yellow}
                  stroke="none"
                  opacity={0.9}
                >
                  {l.char}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </Link>
  )
}

