"use client"

import { Button } from "@/components/ui/button"

export function ShareButton({
  domain,
  query,
}: {
  domain: string
  query?: string
}) {
  const text = query
    ? `i searched "${query}" and found ${domain} on 2dollardomain. cheap first year, renewal shown before buying.`
    : `i almost bought ${domain} on 2dollardomain. should i build it?`

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`

  return (
    <Button asChild variant="secondary" size="sm">
      <a href={url} target="_blank" rel="noreferrer">
        share
      </a>
    </Button>
  )
}
