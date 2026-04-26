import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { domain?: string; platform?: string }

  if (!body.domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    domain: body.domain,
    platform: body.platform ?? "x",
  })
}
