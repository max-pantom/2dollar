import { NextRequest, NextResponse } from "next/server"

import { checkAvailability } from "@/lib/domain/rdap"
import { fetchCheapTlds, porkbunBuyUrl } from "@/lib/registrars/porkbun"

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { domain?: string }
  const domain = body.domain?.trim().toLowerCase()

  if (!domain || !domain.includes(".")) {
    return NextResponse.json(
      { error: "Provide a full domain like example.xyz" },
      { status: 400 }
    )
  }

  const [, ...tldParts] = domain.split(".")
  const tld = tldParts.join(".")
  const tlds = await fetchCheapTlds(Number.POSITIVE_INFINITY)
  const tldInfo = tlds.find((item) => item.extension === tld)

  const availability = await checkAvailability(domain)

  return NextResponse.json({
    domain,
    availability,
    firstYearPrice: tldInfo?.firstYearPrice ?? null,
    renewalPrice: tldInfo?.renewalPrice ?? null,
    registrar: tldInfo ? "Porkbun" : null,
    buyUrl: porkbunBuyUrl(domain),
  })
}
