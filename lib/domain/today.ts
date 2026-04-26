import { buildDomainNotes } from "@/lib/domain/notes"
import { checkAvailability } from "@/lib/domain/rdap"
import { SEED_WORDS } from "@/lib/domain/seeds"
import type { StreamingDomainResult } from "@/lib/domain/types"
import { fetchCheapTlds, porkbunBuyUrl } from "@/lib/registrars/porkbun"

function hashString(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index++) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayFindsStream(
  count = 6
): Promise<StreamingDomainResult[]> {
  const tlds = await fetchCheapTlds()
  if (tlds.length === 0) {
    return []
  }

  const date = todayKey()
  const seed = hashString(date)
  const wordStart = seed % SEED_WORDS.length
  const seeds = Array.from(
    { length: count },
    (_, index) => SEED_WORDS[(wordStart + index) % SEED_WORDS.length]
  )

  return seeds.map((sld, index) => {
    const tld = tlds[(seed + index) % tlds.length]
    const fullDomain = `${sld}.${tld.extension}`
    return {
      domain: fullDomain,
      sld,
      tld: tld.extension,
      availability: checkAvailability(fullDomain),
      firstYearPrice: tld.firstYearPrice,
      renewalPrice: tld.renewalPrice,
      registrar: "Porkbun" as const,
      buyUrl: porkbunBuyUrl(fullDomain),
      notes: buildDomainNotes({
        sld,
        tld: tld.extension,
        firstYearPrice: tld.firstYearPrice,
        renewalPrice: tld.renewalPrice,
      }),
      isAbsoluteCheap: tld.firstYearPrice <= 2,
    }
  })
}
