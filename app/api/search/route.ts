import { NextRequest, NextResponse } from "next/server"

import { searchDomain } from "@/lib/domain/search"

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    query?: string
    limit?: number
  }

  const query = body.query?.trim()
  const limit = Math.min(Math.max(Number(body.limit ?? 50), 1), 200)

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  const { parsed, results, absoluteCheapCount, hasMore } = await searchDomain(
    query,
    limit
  )

  if (!parsed) {
    return NextResponse.json(
      { error: "Could not parse query into a domain or name" },
      { status: 400 }
    )
  }

  return NextResponse.json({ query, parsed, results, absoluteCheapCount, hasMore })
}
