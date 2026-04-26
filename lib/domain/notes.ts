export type DomainNoteKind =
  | "stat"
  | "tag"
  | "deal"
  | "warning"
  | "info"
  | "caveat"

export type DomainNote = {
  kind: DomainNoteKind
  label: string
  value?: string
}

type RenewalRisk = "low" | "med" | "high" | "unknown"

const COMMON_WORDS = new Set([
  "studio",
  "lab",
  "field",
  "press",
  "shop",
  "club",
  "yard",
  "den",
  "post",
  "page",
  "bay",
  "loop",
  "draft",
  "hub",
  "city",
  "kit",
  "deck",
  "salon",
  "wire",
  "mint",
  "house",
  "garden",
  "river",
  "stone",
  "cloud",
  "fire",
  "cold",
  "warm",
  "good",
  "make",
  "build",
  "send",
  "tell",
  "show",
  "find",
  "love",
  "free",
  "open",
  "wild",
  "bright",
  "soft",
  "loud",
  "quick",
  "tiny",
  "huge",
  "deep",
  "fresh",
  "ready",
  "north",
  "south",
  "east",
  "west",
  "money",
  "paper",
  "book",
  "song",
  "voice",
  "story",
])

const TLD_TONE: Record<string, { vibe: string; warn?: string }> = {
  com: { vibe: "classic, trusted, expensive" },
  net: { vibe: "old-internet utility" },
  org: { vibe: "non-profit / community" },
  io: { vibe: "tech, startup default" },
  ai: { vibe: "ai-native brand", warn: "renewal usually steep" },
  co: { vibe: "company alt to .com" },
  dev: { vibe: "developer-leaning" },
  app: { vibe: "app product feel" },
  xyz: { vibe: "experimental, generic, cheap" },
  click: { vibe: "promo / disposable", warn: "renewal can spike hard" },
  link: { vibe: "redirect / bio link" },
  site: { vibe: "general purpose" },
  online: { vibe: "general purpose" },
  store: { vibe: "shop / commerce" },
  fun: { vibe: "playful, side project" },
  blog: { vibe: "publishing / writing" },
  studio: { vibe: "creator brand" },
  press: { vibe: "publishing / brand" },
  me: { vibe: "personal, portfolio" },
  so: { vibe: "verb-y product brand" },
  bio: { vibe: "link in bio / personal" },
  cool: { vibe: "playful" },
  page: { vibe: "publishing-friendly" },
  works: { vibe: "creator portfolio" },
}

const BRANDY_SUFFIXES = [
  "ly",
  "fy",
  "hq",
  "app",
  "lab",
  "studio",
  "press",
  "works",
  "cloud",
  "stack",
  "kit",
  "dev",
] as const

const TLD_CATEGORY: Record<
  string,
  "tech" | "creator" | "commerce" | "throwaway" | "general"
> = {
  io: "tech",
  ai: "tech",
  dev: "tech",
  app: "tech",
  so: "tech",
  me: "creator",
  studio: "creator",
  press: "creator",
  blog: "creator",
  works: "creator",
  store: "commerce",
  shop: "commerce",
  xyz: "throwaway",
  click: "throwaway",
  link: "throwaway",
  lol: "throwaway",
  top: "throwaway",
  site: "general",
  online: "general",
  com: "general",
  net: "general",
  org: "general",
  co: "general",
}

function isPalindrome(value: string) {
  if (value.length < 4) return false
  const lower = value.toLowerCase()
  for (let i = 0, j = lower.length - 1; i < j; i++, j--) {
    if (lower[i] !== lower[j]) return false
  }
  return true
}

function vowelRatio(value: string) {
  const lower = value.toLowerCase()
  let vowels = 0
  let letters = 0
  for (const char of lower) {
    if (/[a-z]/.test(char)) {
      letters += 1
      if ("aeiou".includes(char)) vowels += 1
    }
  }
  if (letters === 0) return 0
  return vowels / letters
}

function longestConsonantRun(value: string) {
  const lower = value.toLowerCase()
  let best = 0
  let run = 0
  for (const char of lower) {
    if (/[a-z]/.test(char) && !"aeiou".includes(char)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}

function hasDoubleLetter(value: string) {
  return /([a-z])\1/i.test(value)
}

function startsWithVowel(value: string) {
  return /^[aeiou]/i.test(value)
}

function endsWithVowel(value: string) {
  return /[aeiou]$/i.test(value)
}

function brandySuffix(value: string): string | null {
  const lower = value.toLowerCase()
  for (const suf of BRANDY_SUFFIXES) {
    if (lower.length > suf.length + 1 && lower.endsWith(suf)) return suf
  }
  return null
}

function tokenList(sld: string) {
  const raw = sld
    .split("-")
    .map((t) => t.trim())
    .filter(Boolean)
  return raw.length >= 2 ? raw : []
}

function readabilityScore(input: {
  sld: string
  tld: string
  firstYearPrice: number
  renewalPrice: number
}): number {
  const { sld, tld, firstYearPrice, renewalPrice } = input

  let score = 100
  const lower = sld.toLowerCase()

  if (lower.length >= 14) score -= 18
  if (lower.length >= 18) score -= 12
  if (lower.includes("-")) score -= 10
  if (/\d/.test(lower)) score -= 12
  if (hasDoubleLetter(lower)) score += 2

  const run = longestConsonantRun(lower)
  if (run >= 4) score -= 14
  if (run >= 6) score -= 10

  const ratio = vowelRatio(lower)
  if (ratio > 0 && ratio < 0.18) score -= 10
  if (ratio > 0.62) score -= 6
  if (ratio >= 0.25 && ratio <= 0.55) score += 6

  const suf = brandySuffix(lower)
  if (suf) score += 4

  // avoid rewarding “$1 first year, $40 renewal” too much
  if (Number.isFinite(renewalPrice) && renewalPrice > 0 && firstYearPrice > 0) {
    const mult = renewalPrice / firstYearPrice
    if (mult >= 5) score -= 8
  }

  const category = TLD_CATEGORY[tld] ?? "general"
  if (category === "throwaway") score -= 4

  return clampInt(score, 0, 100)
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function pronounceableIsh(sld: string) {
  const lower = sld.toLowerCase()
  if (!/^[a-z0-9-]+$/.test(lower)) return false
  if (lower.includes("-")) return false
  if (/\d/.test(lower)) return false
  const ratio = vowelRatio(lower)
  const run = longestConsonantRun(lower)
  return ratio >= 0.25 && ratio <= 0.6 && run <= 3
}

function renewalRiskTier(input: {
  tld: string
  firstYearPrice: number
  renewalPrice: number
}): RenewalRisk {
  const { tld, firstYearPrice, renewalPrice } = input

  // if we don't know, keep it honest
  if (!Number.isFinite(renewalPrice) || renewalPrice <= 0) return "unknown"

  // known spicy zones even if first-year is not extreme
  if (tld === "ai") return "high"
  if (tld === "click") return "high"

  if (renewalPrice >= 30) return "high"
  if (renewalPrice >= 16) return "med"

  if (firstYearPrice > 0) {
    const mult = renewalPrice / firstYearPrice
    if (mult >= 5) return "high"
    if (mult >= 2.5) return "med"
  }

  return "low"
}

export function buildDomainNotes(input: {
  sld: string
  tld: string
  firstYearPrice: number
  renewalPrice: number
}): DomainNote[] {
  const notes: DomainNote[] = []
  const { sld, tld, firstYearPrice, renewalPrice } = input

  const sldLength = sld.length
  notes.push({
    kind: "stat",
    label: "length",
    value: `${sldLength + tld.length + 1} chars`,
  })

  const tokens = tokenList(sld)
  if (tokens.length > 0) {
    notes.push({ kind: "stat", label: "tokens", value: tokens.join(" · ") })
  }

  notes.push({
    kind: "stat",
    label: "readability",
    value: `${readabilityScore({ sld, tld, firstYearPrice, renewalPrice })}/100`,
  })

  if (pronounceableIsh(sld)) {
    notes.push({ kind: "tag", label: "pronounceable-ish" })
  }

  if (hasDoubleLetter(sld)) {
    notes.push({ kind: "tag", label: "double letter" })
  }

  if (startsWithVowel(sld)) {
    notes.push({ kind: "tag", label: "starts with a vowel" })
  }
  if (endsWithVowel(sld)) {
    notes.push({ kind: "tag", label: "ends with a vowel" })
  }

  const suffix = brandySuffix(sld)
  if (suffix) {
    notes.push({ kind: "tag", label: "brandy suffix", value: suffix })
  }

  if (sldLength <= 4) {
    notes.push({ kind: "tag", label: "tiny — easy to remember" })
  } else if (sldLength >= 14) {
    notes.push({ kind: "tag", label: "long — might lose people" })
  }

  if (sld.includes("-")) {
    notes.push({
      kind: "caveat",
      label: "has a hyphen — type-out friction",
    })
  }

  if (/\d/.test(sld)) {
    notes.push({ kind: "caveat", label: "has digits — easy to mishear" })
  }

  if (COMMON_WORDS.has(sld.toLowerCase())) {
    notes.push({ kind: "tag", label: "dictionary word" })
  }

  if (isPalindrome(sld)) {
    notes.push({ kind: "tag", label: "palindrome" })
  }

  const ratio = vowelRatio(sld)
  if (ratio > 0 && ratio < 0.18) {
    notes.push({
      kind: "caveat",
      label: "consonant heavy — sound-it-out test",
    })
  }
  if (ratio > 0.55) {
    notes.push({ kind: "tag", label: "vowel-rich — flows nicely" })
  }

  const tone = TLD_TONE[tld]
  if (tone) {
    notes.push({ kind: "info", label: `.${tld}`, value: tone.vibe })
    if (tone.warn) {
      notes.push({ kind: "warning", label: tone.warn })
    }
  }

  const category = TLD_CATEGORY[tld] ?? "general"
  notes.push({
    kind: "info",
    label: "tld category",
    value: category,
  })

  if (firstYearPrice > 0 && firstYearPrice <= 2.5) {
    notes.push({
      kind: "deal",
      label: "$2-ish",
      value: `$${firstYearPrice.toFixed(2)} first year`,
    })
  }

  const risk = renewalRiskTier({ tld, firstYearPrice, renewalPrice })
  notes.push({
    kind: "info",
    label: "renewal risk",
    value: risk,
  })
  if (risk === "high") {
    notes.push({ kind: "warning", label: "high renewal risk" })
  } else if (risk === "med") {
    notes.push({ kind: "tag", label: "medium renewal risk" })
  }

  if (Number.isFinite(renewalPrice) && renewalPrice > 0 && firstYearPrice > 0) {
    const multiplier = renewalPrice / firstYearPrice
    if (multiplier >= 5) {
      notes.push({
        kind: "warning",
        label: "cheap today, spicy later",
        value: `${multiplier.toFixed(1)}× renewal`,
      })
    } else if (multiplier <= 1.5) {
      notes.push({
        kind: "tag",
        label: "renewal stays close to first year",
      })
    }
  } else if (!Number.isFinite(renewalPrice) || renewalPrice <= 0) {
    notes.push({
      kind: "caveat",
      label: "renewal price not exposed publicly",
    })
  }

  return notes
}
