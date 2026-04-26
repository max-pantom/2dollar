"use client"

import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InventedStyle =
  | "clean"
  | "sticker"
  | "wire"
  | "cutout"
  | "melt"
  | "pixel"
  | "receipt-alien"

type LetterModel = {
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
  stroke: string
  strokeWidth: number
  invented: InventedStyle
  tracking: number
}

const PALETTE = {
  ink: "#0F0F0F",
  red: "#E11D48",
  yellow: "#FFE600",
  cream: "#FFF7E0",
  mint: "#2FBF71",
  orange: "#F97316",
}

const FONTS = [
  { label: "sans", value: "var(--font-sans), ui-sans-serif, system-ui" },
  { label: "mono", value: "var(--font-mono), ui-monospace, SFMono-Regular" },
  { label: "serif", value: "ui-serif, Georgia, Times, serif" },
  { label: "grotesk", value: "ui-sans-serif, system-ui" },
  { label: "display", value: "ui-serif, Georgia, serif" },
] as const

const INVENTED: Array<{ label: string; value: InventedStyle }> = [
  { label: "clean", value: "clean" },
  { label: "sticker gothic", value: "sticker" },
  { label: "wire mono", value: "wire" },
  { label: "cutout serif", value: "cutout" },
  { label: "melted", value: "melt" },
  { label: "pixel bloom", value: "pixel" },
  { label: "alien receipt", value: "receipt-alien" },
]

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

function pick<T>(rand: () => number, items: readonly T[]) {
  return items[Math.floor(rand() * items.length)]
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function jitter(rand: () => number, range: number) {
  return (rand() - 0.5) * 2 * range
}

function defaultLetters(text: string, seed: number): LetterModel[] {
  const rand = mulberry32(seed)
  const chars = Array.from(text)

  return chars.map((char, index) => {
    const isSpace = char.trim().length === 0
    const font = pick(rand, FONTS).value
    const invented = pick(rand, INVENTED).value
    const fontSize = clamp(Math.round(88 + jitter(rand, 18)), 44, 132)

    const loud = rand() < 0.25
    const fill = loud ? PALETTE.red : PALETTE.ink
    const stroke = PALETTE.ink

    return {
      id: `${index}-${char}-${Math.floor(rand() * 1e9)}`,
      char,
      fontFamily: isSpace ? "var(--font-mono)" : font,
      fontWeight: clamp(Math.round(500 + jitter(rand, 350)), 300, 900),
      fontSize: isSpace ? Math.round(fontSize * 0.7) : fontSize,
      rotate: isSpace ? 0 : jitter(rand, 10),
      scaleX: isSpace ? 0.7 : clamp(1 + jitter(rand, 0.28), 0.68, 1.5),
      scaleY: isSpace ? 1 : clamp(1 + jitter(rand, 0.22), 0.7, 1.35),
      skewX: isSpace ? 0 : jitter(rand, 10),
      baseline: isSpace ? 0 : Math.round(jitter(rand, 10)),
      fill,
      stroke,
      strokeWidth: clamp(Number((1.8 + rand() * 1.9).toFixed(2)), 0.8, 4),
      invented,
      tracking: isSpace ? 24 : clamp(Math.round(jitter(rand, 6)), -6, 18),
    }
  })
}

function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  return clone.outerHTML
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

function downloadText(filename: string, value: string, mime: string) {
  const blob = new Blob([value], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Brand2Page() {
  const [text, setText] = useState("2DollarDomain")
  const [seed, setSeed] = useState(() => hashSeed("2DollarDomain"))
  const [letters, setLetters] = useState<LetterModel[]>(() =>
    defaultLetters("2DollarDomain", hashSeed("2DollarDomain"))
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [spacing, setSpacing] = useState(8)
  const [bg, setBg] = useState<"transparent" | "cream" | "yellow">("cream")

  const svgRef = useRef<SVGSVGElement>(null)

  function resetLetters(nextText: string, nextSeed: number) {
    const s = nextSeed >>> 0
    setText(nextText)
    setSeed(s)
    setLetters(defaultLetters(nextText, s))
    setSelected(null)
  }

  const layout = useMemo(() => {
    const y = 140
    const positions = letters.reduce<{ x: number; y: number }[]>(
      (acc) => {
        const prevX = acc.length === 0 ? 24 : acc[acc.length - 1].x
        const prev = letters[acc.length - 1]
        const prevW = prev
          ? prev.char.trim().length === 0
            ? prev.fontSize * 0.45 + prev.tracking
            : prev.fontSize * 0.62 * prev.scaleX
          : 0

        const x = acc.length === 0 ? 24 : prevX + prevW + spacing + prev.tracking
        return [...acc, { x, y }]
      },
      []
    )

    const last = letters[letters.length - 1]
    const lastW = last
      ? last.char.trim().length === 0
        ? last.fontSize * 0.45 + last.tracking
        : last.fontSize * 0.62 * last.scaleX
      : 0
    const lastX = positions.length ? positions[positions.length - 1].x : 24

    const width = Math.max(520, lastX + lastW + 48)
    return { positions, width, height: 220 }
  }, [letters, spacing])

  const selectedLetter = selected === null ? null : letters[selected]

  function randomizeAll() {
    const nextSeed = (seed + 1 + Math.floor(Math.random() * 1e9)) >>> 0
    resetLetters(text, nextSeed)
  }

  function randomizeSelected() {
    if (selected === null) return
    const nextSeed = (seed + 99991 + selected * 13) >>> 0
    const rand = mulberry32(nextSeed)
    setLetters((prev) => {
      const next = [...prev]
      const l = next[selected]
      if (!l) return prev
      next[selected] = {
        ...l,
        fontFamily: pick(rand, FONTS).value,
        fontWeight: clamp(Math.round(500 + jitter(rand, 350)), 300, 900),
        fontSize: clamp(Math.round(l.fontSize + jitter(rand, 18)), 40, 150),
        rotate: jitter(rand, 12),
        scaleX: clamp(1 + jitter(rand, 0.28), 0.7, 1.55),
        scaleY: clamp(1 + jitter(rand, 0.22), 0.7, 1.4),
        skewX: jitter(rand, 12),
        baseline: Math.round(jitter(rand, 10)),
        invented: pick(rand, INVENTED).value,
        fill: rand() < 0.33 ? PALETTE.red : PALETTE.ink,
        strokeWidth: clamp(Number((1.6 + rand() * 2.2).toFixed(2)), 0.8, 4.5),
      }
      return next
    })
  }

  function applyToSelected(patch: Partial<LetterModel>) {
    if (selected === null) return
    setLetters((prev) => {
      const next = [...prev]
      next[selected] = { ...next[selected], ...patch }
      return next
    })
  }

  async function copySvg() {
    if (!svgRef.current) return
    await copyText(serializeSvg(svgRef.current))
  }

  function downloadSvg() {
    if (!svgRef.current) return
    downloadText("glyphmix.svg", serializeSvg(svgRef.current), "image/svg+xml")
  }

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center gap-2 font-mono text-xs tracking-widest uppercase text-muted-foreground">
              <span className="rounded border border-border bg-muted/40 px-2 py-1">
                /brand/2
              </span>
              <span>glyphmix — wordmark chaos tool</span>
            </div>
            <h1 className="mode-headline text-3xl font-semibold tracking-tight md:text-5xl">
              mix every letter.
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-sm text-muted-foreground">
              Type a word. Every character gets a different vibe (fonts + invented
              glyph styles). Randomize until it feels like a logo. Copy SVG.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={randomizeAll} size="sm">
              randomize all
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={randomizeSelected}
              size="sm"
              disabled={selected === null}
            >
              randomize letter
            </Button>
            <Button type="button" variant="secondary" onClick={copySvg} size="sm">
              copy svg
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadSvg}
              size="sm"
            >
              download svg
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="mode-panel rounded border border-border bg-background p-4">
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="glyphmix-text"
                  className="font-mono text-xs tracking-widest uppercase text-muted-foreground"
                >
                  word
                </label>
                <input
                  id="glyphmix-text"
                  value={text}
                  onChange={(e) => resetLetters(e.target.value.slice(0, 42), seed)}
                  className="w-full rounded border border-foreground bg-background px-3 py-2 font-mono text-sm outline-none focus:bg-muted/40"
                  spellCheck={false}
                  autoComplete="off"
                />
                <div className="text-xs text-muted-foreground">
                  tip: spaces + hyphens create “patchwork”
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="seed">
                  <input
                    value={String(seed)}
                    onChange={(e) =>
                      resetLetters(
                        text,
                        Number.isFinite(Number(e.target.value))
                          ? (Number(e.target.value) >>> 0)
                          : seed
                      )
                    }
                    className="w-full rounded border border-border bg-muted/40 px-3 py-2 font-mono text-xs outline-none focus:bg-background"
                  />
                </Field>
                <Field label="spacing">
                  <input
                    type="range"
                    min={-2}
                    max={28}
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full"
                  />
                </Field>
                <Field label="background">
                  <select
                    value={bg}
                    onChange={(e) =>
                      setBg(e.target.value as "transparent" | "cream" | "yellow")
                    }
                    className="w-full rounded border border-border bg-muted/40 px-3 py-2 font-mono text-xs outline-none focus:bg-background"
                  >
                    <option value="transparent">transparent</option>
                    <option value="cream">cream</option>
                    <option value="yellow">scene yellow</option>
                  </select>
                </Field>
                <Field label="selected">
                  <div className="rounded border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                    {selectedLetter
                      ? `${selectedLetter.char || "␠"} (#${(selected ?? 0) + 1})`
                      : "none"}
                  </div>
                </Field>
              </div>

              <div className="border-t border-dashed border-border pt-5">
                <div className="mb-2 font-mono text-xs tracking-widest uppercase text-muted-foreground">
                  letter controls
                </div>

                {selectedLetter ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="invented">
                      <select
                        value={selectedLetter.invented}
                        onChange={(e) =>
                          applyToSelected({
                            invented: e.target.value as InventedStyle,
                          })
                        }
                        className="w-full rounded border border-border bg-muted/40 px-3 py-2 font-mono text-xs outline-none focus:bg-background"
                      >
                        {INVENTED.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="font">
                      <select
                        value={selectedLetter.fontFamily}
                        onChange={(e) =>
                          applyToSelected({ fontFamily: e.target.value })
                        }
                        className="w-full rounded border border-border bg-muted/40 px-3 py-2 font-mono text-xs outline-none focus:bg-background"
                      >
                        {FONTS.map((f) => (
                          <option key={f.label} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="size">
                      <input
                        type="range"
                        min={28}
                        max={160}
                        value={selectedLetter.fontSize}
                        onChange={(e) =>
                          applyToSelected({ fontSize: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="weight">
                      <input
                        type="range"
                        min={300}
                        max={900}
                        step={50}
                        value={selectedLetter.fontWeight}
                        onChange={(e) =>
                          applyToSelected({ fontWeight: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="rotate">
                      <input
                        type="range"
                        min={-24}
                        max={24}
                        value={selectedLetter.rotate}
                        onChange={(e) =>
                          applyToSelected({ rotate: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="baseline">
                      <input
                        type="range"
                        min={-24}
                        max={24}
                        value={selectedLetter.baseline}
                        onChange={(e) =>
                          applyToSelected({ baseline: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="stretch x">
                      <input
                        type="range"
                        min={0.55}
                        max={1.8}
                        step={0.01}
                        value={selectedLetter.scaleX}
                        onChange={(e) =>
                          applyToSelected({ scaleX: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="stretch y">
                      <input
                        type="range"
                        min={0.55}
                        max={1.6}
                        step={0.01}
                        value={selectedLetter.scaleY}
                        onChange={(e) =>
                          applyToSelected({ scaleY: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="skew x">
                      <input
                        type="range"
                        min={-22}
                        max={22}
                        value={selectedLetter.skewX}
                        onChange={(e) =>
                          applyToSelected({ skewX: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </Field>
                    <Field label="stroke">
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={0.1}
                        value={selectedLetter.strokeWidth}
                        onChange={(e) =>
                          applyToSelected({
                            strokeWidth: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Click a letter in the preview.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mode-panel rounded border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                preview (click letters)
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                export is SVG text (fonts may vary on other machines)
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <div
                className={cn(
                  "inline-block rounded border border-border",
                  bg === "transparent" && "bg-transparent",
                  bg === "cream" && "bg-[#fff7e0]",
                  bg === "yellow" && "bg-[#ffe600]"
                )}
              >
                <svg
                  ref={svgRef}
                  width={layout.width}
                  height={layout.height}
                  viewBox={`0 0 ${layout.width} ${layout.height}`}
                  className="block"
                >
                  <defs>
                    <filter id="f-melt" x="-20%" y="-40%" width="140%" height="200%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012"
                        numOctaves="2"
                        seed="7"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="14"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                    <filter id="f-pixel" x="-20%" y="-20%" width="140%" height="140%">
                      <feComponentTransfer>
                        <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
                        <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
                        <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
                      </feComponentTransfer>
                    </filter>
                    <filter id="f-jitter" x="-30%" y="-30%" width="160%" height="160%">
                      <feTurbulence
                        type="turbulence"
                        baseFrequency="0.9"
                        numOctaves="1"
                        seed="2"
                        result="n"
                      />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" />
                    </filter>
                    <filter id="f-cutout" x="-30%" y="-30%" width="160%" height="160%">
                      <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="d" />
                      <feComposite in="d" in2="SourceGraphic" operator="xor" />
                    </filter>
                  </defs>

                  {letters.map((l, index) => {
                    const p = layout.positions[index]
                    const isSpace = l.char.trim().length === 0
                    const filter = filterFor(l.invented)
                    const { fill, stroke, strokeWidth } = paintFor(l)

                    const transform = `translate(${p.x},${p.y + l.baseline}) rotate(${l.rotate}) skewX(${l.skewX}) scale(${l.scaleX},${l.scaleY})`
                    const active = selected === index

                    return (
                      <g
                        key={l.id}
                        transform={transform}
                        style={{ cursor: isSpace ? "default" : "pointer" }}
                        onClick={() => (isSpace ? null : setSelected(index))}
                        opacity={isSpace ? 0.22 : 1}
                      >
                        {active ? (
                          <rect
                            x={-10}
                            y={-l.fontSize * 1.05}
                            width={l.fontSize * 1.2}
                            height={l.fontSize * 1.55}
                            fill="transparent"
                            stroke={PALETTE.mint}
                            strokeWidth={2}
                          />
                        ) : null}

                        <text
                          x={0}
                          y={0}
                          fontFamily={l.fontFamily}
                          fontSize={l.fontSize}
                          fontWeight={l.fontWeight}
                          fill={fill}
                          stroke={strokeWidth > 0 ? stroke : "none"}
                          strokeWidth={strokeWidth}
                          strokeLinejoin="round"
                          paintOrder="stroke fill"
                          filter={filter ? `url(#${filter})` : undefined}
                        >
                          {isSpace ? "·" : l.char}
                        </text>

                        {l.invented === "sticker" ? (
                          <text
                            x={3}
                            y={3}
                            fontFamily={l.fontFamily}
                            fontSize={l.fontSize}
                            fontWeight={l.fontWeight}
                            fill={PALETTE.yellow}
                            stroke="none"
                            opacity={0.9}
                          >
                            {isSpace ? "·" : l.char}
                          </text>
                        ) : null}

                        {l.invented === "wire" ? (
                          <text
                            x={0}
                            y={0}
                            fontFamily={l.fontFamily}
                            fontSize={l.fontSize}
                            fontWeight={l.fontWeight}
                            fill="transparent"
                            stroke={PALETTE.ink}
                            strokeWidth={Math.max(1.2, strokeWidth)}
                            strokeLinejoin="round"
                            opacity={0.9}
                          >
                            {isSpace ? "·" : l.char}
                          </text>
                        ) : null}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function filterFor(style: InventedStyle): string | null {
  if (style === "melt") return "f-melt"
  if (style === "pixel") return "f-pixel"
  if (style === "receipt-alien") return "f-jitter"
  if (style === "cutout") return "f-cutout"
  return null
}

function paintFor(letter: LetterModel) {
  if (letter.invented === "cutout") {
    return {
      fill: PALETTE.cream,
      stroke: PALETTE.ink,
      strokeWidth: Math.max(2.2, letter.strokeWidth),
    }
  }
  if (letter.invented === "receipt-alien") {
    return {
      fill: letter.fill,
      stroke: PALETTE.ink,
      strokeWidth: Math.max(1.4, letter.strokeWidth),
    }
  }
  return {
    fill: letter.fill,
    stroke: letter.stroke,
    strokeWidth: letter.strokeWidth,
  }
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  )
}

