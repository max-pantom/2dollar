import { fetchCheapTlds, type TldPrice as PorkbunTldPrice } from "@/lib/registrars/porkbun"
import { fetchNamecheapTlds, type NamecheapTldPrice } from "@/lib/registrars/namecheap"

export type UnifiedTldPrice = {
  extension: string
  firstYearPrice: number
  renewalPrice: number
  registrar: "Porkbun" | "Namecheap"
  transferPrice?: number
  specialType?: string
}

function toUnifiedPorkbun(p: PorkbunTldPrice): UnifiedTldPrice {
  return {
    extension: p.extension,
    firstYearPrice: p.firstYearPrice,
    renewalPrice: p.renewalPrice,
    registrar: "Porkbun",
    transferPrice: p.transferPrice,
    specialType: p.specialType,
  }
}

function toUnifiedNamecheap(n: NamecheapTldPrice): UnifiedTldPrice {
  return {
    extension: n.extension,
    firstYearPrice: n.firstYearPrice,
    renewalPrice: n.renewalPrice,
    registrar: "Namecheap",
  }
}

export async function fetchMergedCheapTlds(
  maxPrice = 5
): Promise<UnifiedTldPrice[]> {
  const [porkbun, namecheap] = await Promise.all([
    fetchCheapTlds(maxPrice),
    fetchNamecheapTlds(maxPrice),
  ])

  const merged = new Map<string, UnifiedTldPrice>()

  for (const p of porkbun) {
    merged.set(p.extension, toUnifiedPorkbun(p))
  }

  for (const n of namecheap) {
    const existing = merged.get(n.extension)
    const candidate = toUnifiedNamecheap(n)
    if (!existing) {
      merged.set(n.extension, candidate)
      continue
    }
    if (
      candidate.firstYearPrice < existing.firstYearPrice ||
      (candidate.firstYearPrice === existing.firstYearPrice &&
        candidate.renewalPrice > 0 &&
        (existing.renewalPrice <= 0 || candidate.renewalPrice < existing.renewalPrice))
    ) {
      merged.set(n.extension, candidate)
    }
  }

  return [...merged.values()].sort((a, b) => a.firstYearPrice - b.firstYearPrice)
}

