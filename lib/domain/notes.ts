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

  if (firstYearPrice > 0 && firstYearPrice <= 2.5) {
    notes.push({
      kind: "deal",
      label: "$2-ish",
      value: `$${firstYearPrice.toFixed(2)} first year`,
    })
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
