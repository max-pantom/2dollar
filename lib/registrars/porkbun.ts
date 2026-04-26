export type TldPrice = {
  extension: string
  firstYearPrice: number
  renewalPrice: number
  transferPrice: number
  registrar: "Porkbun"
  specialType: string
}

const FALLBACK_TLDS: TldPrice[] = [
  {
    extension: "xyz",
    firstYearPrice: 1.98,
    renewalPrice: 13.98,
    transferPrice: 13.98,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "site",
    firstYearPrice: 1.99,
    renewalPrice: 18,
    transferPrice: 18,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "fun",
    firstYearPrice: 1.88,
    renewalPrice: 19.98,
    transferPrice: 19.98,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "space",
    firstYearPrice: 1.49,
    renewalPrice: 20,
    transferPrice: 20,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "buzz",
    firstYearPrice: 2.05,
    renewalPrice: 26.26,
    transferPrice: 26.26,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "lol",
    firstYearPrice: 1.98,
    renewalPrice: 24.98,
    transferPrice: 24.98,
    registrar: "Porkbun",
    specialType: "promo",
  },
  {
    extension: "mom",
    firstYearPrice: 1.54,
    renewalPrice: 26.26,
    transferPrice: 26.26,
    registrar: "Porkbun",
    specialType: "promo",
  },
]

type PorkbunPricingResponse = {
  status: string
  pricing?: Record<
    string,
    {
      registration: string
      renewal: string
      transfer: string
      specialType?: string | null
    }
  >
}

export async function fetchCheapTlds(maxPrice = 2.5): Promise<TldPrice[]> {
  try {
    const response = await fetch(
      "https://api.porkbun.com/api/json/v3/pricing/get",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        next: { revalidate: 60 * 60 * 24 },
      }
    )

    if (!response.ok) {
      return getFallback(maxPrice)
    }

    const json = (await response.json()) as PorkbunPricingResponse

    if (json.status !== "SUCCESS" || !json.pricing) {
      return getFallback(maxPrice)
    }

    const tlds = Object.entries(json.pricing)
      .map(([extension, prices]) => ({
        extension,
        firstYearPrice: Number.parseFloat(prices.registration),
        renewalPrice: Number.parseFloat(prices.renewal),
        transferPrice: Number.parseFloat(prices.transfer),
        registrar: "Porkbun" as const,
        specialType: prices.specialType ?? "",
      }))
      .filter(
        (item) =>
          Number.isFinite(item.firstYearPrice) &&
          item.firstYearPrice > 0 &&
          item.firstYearPrice <= maxPrice
      )
      .sort((a, b) => a.firstYearPrice - b.firstYearPrice)

    return tlds.length > 0 ? tlds : getFallback(maxPrice)
  } catch {
    return getFallback(maxPrice)
  }
}

function getFallback(maxPrice: number) {
  return FALLBACK_TLDS.filter((item) => item.firstYearPrice <= maxPrice).sort(
    (a, b) => a.firstYearPrice - b.firstYearPrice
  )
}

export function porkbunBuyUrl(domain: string) {
  return `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`
}
