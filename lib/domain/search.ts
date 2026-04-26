import { buildDomainNotes } from "@/lib/domain/notes"
import { checkAvailability, type Availability } from "@/lib/domain/rdap"
import type {
  DomainResult,
  ParsedQuery,
  StreamingDomainResult,
} from "@/lib/domain/types"
import { fetchCheapTlds, porkbunBuyUrl } from "@/lib/registrars/porkbun"

export { SEED_WORDS, pickRandomSeed } from "@/lib/domain/seeds"
export type { DomainNote } from "@/lib/domain/notes"
export type { DomainResult, ParsedQuery, StreamingDomainResult } from "@/lib/domain/types"

const NAME_PREFIXES = [
  "get",
  "my",
  "try",
  "use",
  "go",
  "hi",
  "hey",
  "app",
  "io",
  "me",
  "we",
  "do",
  "make",
  "build",
  "run",
  "start",
  "join",
  "let",
]

const UNINTERESTING_PREFIXES = new Set([
  "get",
  "my",
  "try",
  "use",
  "go",
  "hi",
  "hey",
  "app",
  "io",
  "me",
  "we",
  "do",
])

function isUninterestingPrefix(word: string): boolean {
  return UNINTERESTING_PREFIXES.has(word.toLowerCase())
}

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
  limit = 50
): Promise<{ parsed: ParsedQuery | null; results: DomainResult[]; absoluteCheapCount: number; hasMore: boolean }> {
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
    hasMore: stream.hasMore,
    results: results.sort(
      (a, b) =>
        availabilityOrder(a.availability) - availabilityOrder(b.availability) ||
        a.firstYearPrice - b.firstYearPrice
    ),
  }
}

export async function searchDomainStream(
  query: string,
  limit = 50
): Promise<{
  parsed: ParsedQuery | null
  results: StreamingDomainResult[]
  absoluteCheapCount: number
  hasMore: boolean
}> {
  const parsed = parseQuery(query)

  if (!parsed) {
    return { parsed: null, results: [], absoluteCheapCount: 0, hasMore: false }
  }

  const tlds = await fetchCheapTlds(5)
  const absoluteCheapTlds = tlds.filter((t) => t.firstYearPrice <= 2)
  const absoluteCheapCount = absoluteCheapTlds.length

  if (parsed.type === "exact") {
    const tldInfo = tlds.find((item) => item.extension === parsed.tld)
    const fullDomain = `${parsed.sld}.${parsed.tld}`
    const firstYearPrice = tldInfo?.firstYearPrice ?? 0
    const renewalPrice = tldInfo?.renewalPrice ?? 0

    const variations: StreamingDomainResult[] = []

    for (const prefix of NAME_PREFIXES) {
      const variant = `${prefix}${parsed.sld}`
      if (variant !== parsed.sld) {
        variations.push({
          domain: `${variant}.${parsed.tld}`,
          sld: variant,
          tld: parsed.tld,
          availability: checkAvailability(`${variant}.${parsed.tld}`),
          firstYearPrice,
          renewalPrice,
          registrar: "Porkbun",
          buyUrl: porkbunBuyUrl(`${variant}.${parsed.tld}`),
          notes: buildDomainNotes({
            sld: variant,
            tld: parsed.tld,
            firstYearPrice,
            renewalPrice,
          }),
          isAbsoluteCheap: firstYearPrice <= 2,
        })
      }
    }

    return {
      parsed,
      absoluteCheapCount,
      hasMore: false,
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
        ...variations,
      ],
    }
  }

  const allResults: StreamingDomainResult[] = []

  for (const tld of tlds) {
    allResults.push({
      domain: `${parsed.sld}.${tld.extension}`,
      sld: parsed.sld,
      tld: tld.extension,
      availability: checkAvailability(`${parsed.sld}.${tld.extension}`),
      firstYearPrice: tld.firstYearPrice,
      renewalPrice: tld.renewalPrice,
      registrar: "Porkbun" as const,
      buyUrl: porkbunBuyUrl(`${parsed.sld}.${tld.extension}`),
      notes: buildDomainNotes({
        sld: parsed.sld,
        tld: tld.extension,
        firstYearPrice: tld.firstYearPrice,
        renewalPrice: tld.renewalPrice,
      }),
      isAbsoluteCheap: tld.firstYearPrice <= 2,
    })

    if (!isUninterestingPrefix(parsed.sld)) {
      for (const prefix of NAME_PREFIXES) {
        const variant = `${prefix}${parsed.sld}`
        allResults.push({
          domain: `${variant}.${tld.extension}`,
          sld: variant,
          tld: tld.extension,
          availability: checkAvailability(`${variant}.${tld.extension}`),
          firstYearPrice: tld.firstYearPrice,
          renewalPrice: tld.renewalPrice,
          registrar: "Porkbun" as const,
          buyUrl: porkbunBuyUrl(`${variant}.${tld.extension}`),
          notes: buildDomainNotes({
            sld: variant,
            tld: tld.extension,
            firstYearPrice: tld.firstYearPrice,
            renewalPrice: tld.renewalPrice,
          }),
          isAbsoluteCheap: tld.firstYearPrice <= 2,
        })
      }
    }
  }

  const results = allResults.slice(0, limit)
  const hasMore = allResults.length > limit

  return { parsed, results, absoluteCheapCount, hasMore }
}

function availabilityOrder(availability: Availability) {
  if (availability === "available") return 0
  if (availability === "unknown") return 1
  return 2
}