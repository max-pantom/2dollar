import { buildDomainNotes, type DomainNote } from "@/lib/domain/notes"
import { checkAvailability, type Availability } from "@/lib/domain/rdap"
import { fetchCheapTlds, porkbunBuyUrl } from "@/lib/registrars/porkbun"

export { SEED_WORDS, pickRandomSeed } from "@/lib/domain/seeds"
export type { DomainNote } from "@/lib/domain/notes"

export type DomainResult = {
  domain: string
  sld: string
  tld: string
  availability: Availability
  firstYearPrice: number
  renewalPrice: number
  registrar: "Porkbun"
  buyUrl: string
  notes: DomainNote[]
  isAbsoluteCheap: boolean
}

export type StreamingDomainResult = Omit<DomainResult, "availability"> & {
  availability: Promise<Availability>
}

export type ParsedQuery =
  | { type: "exact"; sld: string; tld: string }
  | { type: "name"; sld: string }

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "")
}

export function parseQuery(input: string): ParsedQuery | null {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, "")

  if (!cleaned) {
    return null
  }

  if (cleaned.includes(".")) {
    const [sldRaw, ...tldParts] = cleaned.split(".")
    const tldRaw = tldParts.join(".")
    const sld = slugify(sldRaw)
    const tld = slugify(tldRaw)

    if (!sld || !tld) {
      return null
    }

    return { type: "exact", sld, tld }
  }

  const sld = slugify(cleaned)

  if (!sld) {
    return null
  }

  return { type: "name", sld }
}

export async function searchDomain(
  query: string,
  limit = 15
): Promise<{ parsed: ParsedQuery | null; results: DomainResult[]; absoluteCheapCount: number }> {
  const stream = await searchDomainStream(query, limit)
  const results = await Promise.all(
    stream.results.map(async (item) => ({
      ...item,
      availability: await item.availability,
    }))
  )

  return {
    parsed: stream.parsed,
    absoluteCheapCount: stream.absoluteCheapCount,
    results: results.sort(
      (a, b) =>
        availabilityOrder(a.availability) - availabilityOrder(b.availability) ||
        a.firstYearPrice - b.firstYearPrice
    ),
  }
}

export async function searchDomainStream(
  query: string,
  limit = 15
): Promise<{
  parsed: ParsedQuery | null
  results: StreamingDomainResult[]
  absoluteCheapCount: number
}> {
  const parsed = parseQuery(query)

  if (!parsed) {
    return { parsed: null, results: [], absoluteCheapCount: 0 }
  }

  const tlds = await fetchCheapTlds()
  const absoluteCheapTlds = tlds.filter((t) => t.firstYearPrice <= 2)
  const absoluteCheapCount = absoluteCheapTlds.length

  if (parsed.type === "exact") {
    const tldInfo = tlds.find((item) => item.extension === parsed.tld)
    const fullDomain = `${parsed.sld}.${parsed.tld}`
    const firstYearPrice = tldInfo?.firstYearPrice ?? 0
    const renewalPrice = tldInfo?.renewalPrice ?? 0

    return {
      parsed,
      absoluteCheapCount,
      results: [
        {
          domain: fullDomain,
          sld: parsed.sld,
          tld: parsed.tld,
          availability: checkAvailability(fullDomain),
          firstYearPrice,
          renewalPrice,
          registrar: "Porkbun",
          buyUrl: porkbunBuyUrl(fullDomain),
          notes: buildDomainNotes({
            sld: parsed.sld,
            tld: parsed.tld,
            firstYearPrice,
            renewalPrice,
          }),
          isAbsoluteCheap: firstYearPrice <= 2,
        },
      ],
    }
  }

  const candidates = tlds.slice(0, limit)

  const results = candidates.map((tld) => {
    const fullDomain = `${parsed.sld}.${tld.extension}`
    return {
      domain: fullDomain,
      sld: parsed.sld,
      tld: tld.extension,
      availability: checkAvailability(fullDomain),
      firstYearPrice: tld.firstYearPrice,
      renewalPrice: tld.renewalPrice,
      registrar: "Porkbun" as const,
      buyUrl: porkbunBuyUrl(fullDomain),
      notes: buildDomainNotes({
        sld: parsed.sld,
        tld: tld.extension,
        firstYearPrice: tld.firstYearPrice,
        renewalPrice: tld.renewalPrice,
      }),
      isAbsoluteCheap: tld.firstYearPrice <= 2,
    }
  })

  return { parsed, results, absoluteCheapCount }
}

function availabilityOrder(availability: Availability) {
  if (availability === "available") return 0
  if (availability === "unknown") return 1
  return 2
}
