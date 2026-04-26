export const SEED_WORDS = [
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
] as const

export function pickRandomSeed(): string {
  return SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)]
}
