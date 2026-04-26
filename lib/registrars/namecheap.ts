import { XMLParser } from "fast-xml-parser"

export type NamecheapTldPrice = {
  extension: string
  firstYearPrice: number
  renewalPrice: number
  registrar: "Namecheap"
}

type NamecheapPriceNode = { Duration?: string | number; Price?: string | number }
type NamecheapProductNode = {
  Name?: string
  Price?: NamecheapPriceNode | NamecheapPriceNode[]
}
type NamecheapApiDoc = {
  ApiResponse?: {
    CommandResponse?: {
      UserGetPricingResult?: {
        ProductType?: {
          ProductCategory?: { Product?: NamecheapProductNode | NamecheapProductNode[] }
        }
      }
    }
  }
}

function env(key: string) {
  const v = process.env[key]
  return v && v.trim().length > 0 ? v.trim() : null
}

function baseUrl() {
  const useSandbox = env("NAMECHEAP_SANDBOX") === "true"
  return useSandbox
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response"
}

function requiredConfig() {
  const apiUser = env("NAMECHEAP_API_USER")
  const apiKey = env("NAMECHEAP_API_KEY")
  const userName = env("NAMECHEAP_USERNAME")
  const clientIp = env("NAMECHEAP_CLIENT_IP")
  if (!apiUser || !apiKey || !userName || !clientIp) return null
  return { apiUser, apiKey, userName, clientIp }
}

async function fetchPricingXml(action: "REGISTER" | "RENEW") {
  const cfg = requiredConfig()
  if (!cfg) return null

  const url = new URL(baseUrl())
  url.searchParams.set("ApiUser", cfg.apiUser)
  url.searchParams.set("ApiKey", cfg.apiKey)
  url.searchParams.set("UserName", cfg.userName)
  url.searchParams.set("ClientIp", cfg.clientIp)
  url.searchParams.set("Command", "namecheap.users.getPricing")
  url.searchParams.set("ProductType", "DOMAIN")
  url.searchParams.set("ProductCategory", "DOMAINS")
  url.searchParams.set("Action", action)

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/xml,text/xml" },
    next: { revalidate: 60 * 60 * 24 },
  })
  if (!res.ok) return null
  return await res.text()
}

function parsePricesByTld(xml: string): Map<string, number> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
  })
  const doc = parser.parse(xml) as unknown as NamecheapApiDoc

  const products =
    doc?.ApiResponse?.CommandResponse?.UserGetPricingResult?.ProductType
      ?.ProductCategory?.Product ?? []

  const arr = Array.isArray(products) ? products : [products]
  const map = new Map<string, number>()

  for (const p of arr) {
    const ext = String(p?.Name ?? "").toLowerCase()
    if (!ext) continue
    const prices = p?.Price ?? []
    const priceArr = Array.isArray(prices) ? prices : [prices]
    const oneYear = priceArr.find((x) => String(x?.Duration) === "1")
    const val = Number.parseFloat(String(oneYear?.Price ?? "NaN"))
    if (!Number.isFinite(val) || val <= 0) continue
    map.set(ext, val)
  }

  return map
}

export async function fetchNamecheapTlds(
  maxPrice = 5
): Promise<NamecheapTldPrice[]> {
  const cfg = requiredConfig()
  if (!cfg) return []

  const [registerXml, renewXml] = await Promise.all([
    fetchPricingXml("REGISTER"),
    fetchPricingXml("RENEW"),
  ])

  if (!registerXml || !renewXml) return []

  const register = parsePricesByTld(registerXml)
  const renew = parsePricesByTld(renewXml)

  const out: NamecheapTldPrice[] = []
  for (const [ext, regPrice] of register.entries()) {
    if (regPrice > maxPrice) continue
    const renewalPrice = renew.get(ext) ?? 0
    out.push({
      extension: ext,
      firstYearPrice: regPrice,
      renewalPrice,
      registrar: "Namecheap",
    })
  }

  out.sort((a, b) => a.firstYearPrice - b.firstYearPrice)
  return out
}

