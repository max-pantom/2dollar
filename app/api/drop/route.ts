import { NextResponse } from "next/server"

import { fetchCheapTlds } from "@/lib/registrars/porkbun"

export async function GET() {
  const tlds = await fetchCheapTlds()
  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    tlds,
  })
}
