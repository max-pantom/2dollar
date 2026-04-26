import { NextRequest, NextResponse } from "next/server"

import { fetchCheapTlds } from "@/lib/registrars/porkbun"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)
  const offset = parseInt(searchParams.get("offset") ?? "0")

  const tlds = await fetchCheapTlds(5)
  const total = tlds.length
  const paginated = tlds.slice(offset, offset + limit)
  const hasMore = offset + limit < total

  return NextResponse.json({
    tlds: paginated,
    total,
    hasMore,
  })
}