"use client"

import Link from "next/link"
import { type ReactNode, useState } from "react"

import { ShareButton } from "@/components/share-button"
import { Sticker } from "@/components/sticker"
import { Button } from "@/components/ui/button"
import type { DomainNote } from "@/lib/domain/notes"
import { cn } from "@/lib/utils"

export type DomainCardProps = {
  domain: string
  firstYearPrice: number
  renewalPrice: number
  registrar: string
  buyUrl: string
  availabilitySlot: ReactNode
  notes?: DomainNote[]
  query?: string
  defaultOpen?: boolean
}

export function DomainCard({
  domain,
  firstYearPrice,
  renewalPrice,
  registrar,
  buyUrl,
  availabilitySlot,
  notes = [],
  query,
  defaultOpen = false,
}: DomainCardProps) {
  const [copied, setCopied] = useState(false)
  const isDeal = firstYearPrice > 0 && firstYearPrice <= 2.5
  const renewalUnknown = !Number.isFinite(renewalPrice) || renewalPrice <= 0

  const stickerNotes = notes.filter(
    (n) => n.kind === "deal" || n.kind === "warning" || n.kind === "tag"
  )
  const factNotes = notes.filter(
    (n) => n.kind === "stat" || n.kind === "info" || n.kind === "caveat"
  )

  async function copyDomain(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(domain)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <details
      className="group border-t border-border first:border-t-0"
      open={defaultOpen}
    >
      <summary className="-mx-2 flex cursor-pointer list-none items-center gap-3 rounded px-2 py-4 outline-none hover:bg-muted/40 focus-visible:bg-muted/50">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate font-mono text-lg font-medium tracking-tight md:text-xl">
            {domain}
          </span>
          {isDeal ? (
            <span className="hidden md:inline-flex">
              <Sticker tone="deal">$2-ish</Sticker>
            </span>
          ) : null}
          <button
            type="button"
            onClick={copyDomain}
            aria-label={copied ? "copied" : `copy ${domain}`}
            className={cn(
              "shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground",
              copied && "text-accent hover:text-accent"
            )}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </span>

        <span className="hidden md:inline-flex">{availabilitySlot}</span>

        <span className="ml-auto flex shrink-0 items-baseline gap-1 font-mono text-sm tabular-nums md:text-base">
          {firstYearPrice > 0 ? (
            <>
              <span className="font-medium">${firstYearPrice.toFixed(2)}</span>
              <span className="text-muted-foreground">/yr1</span>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>

        <ChevronIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-4 px-2 pt-1 pb-5">
        <div className="flex flex-wrap items-center gap-3 md:hidden">
          {availabilitySlot}
          {isDeal ? <Sticker tone="deal">$2-ish</Sticker> : null}
        </div>

        {stickerNotes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {stickerNotes.map((note, index) => (
              <Sticker key={`${note.label}-${index}`} tone={stickerTone(note)}>
                {note.value ? `${note.label} · ${note.value}` : note.label}
              </Sticker>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2 font-mono text-sm">
          <Row k="first year">
            <span className="font-medium tabular-nums">
              {firstYearPrice > 0 ? `$${firstYearPrice.toFixed(2)}` : "unknown"}
            </span>
          </Row>
          <Row k="renews yearly">
            <span className="font-medium tabular-nums">
              {renewalUnknown ? "unknown" : `$${renewalPrice.toFixed(2)}`}
            </span>
          </Row>
          <Row k="registrar">
            <span>{registrar}</span>
          </Row>
          {factNotes.map((note, index) => (
            <Row key={`${note.label}-${index}`} k={note.label}>
              <span
                className={cn(
                  "tabular-nums",
                  note.kind === "caveat" && "text-warning",
                  note.kind === "info" && "text-muted-foreground"
                )}
              >
                {note.value ?? "—"}
              </span>
            </Row>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <a href={buyUrl} target="_blank" rel="noreferrer">
              buy on {registrar.toLowerCase()}
            </a>
          </Button>
          <ShareButton domain={domain} query={query} />
          <Button asChild variant="ghost" size="sm">
            <Link href={`/domain/${domain}`}>open detail page</Link>
          </Button>
        </div>
      </div>
    </details>
  )
}

function stickerTone(note: DomainNote): "deal" | "warning" | "muted" {
  if (note.kind === "deal") return "deal"
  if (note.kind === "warning") return "warning"
  return "muted"
}

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      {children}
    </div>
  )
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="1" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <polyline points="4 12 10 18 20 6" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
