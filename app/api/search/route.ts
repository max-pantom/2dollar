import { NextRequest, NextResponse } from "next/server"

import { searchDomain } from "@/lib/domain/search"

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    query?: string
  }

  const query = body.query?.trim()

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  const { parsed, results } = await searchDomain(query)

  if (!parsed) {
    return NextResponse.json(
      { error: "Could not parse query into a domain or name" },
      { status: 400 }
    )
  }

  return NextResponse.json({ query, parsed, results })
}
