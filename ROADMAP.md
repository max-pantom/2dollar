# 2dollardomain roadmap

Stuff queued for later, not yet built.

## Affiliate + analytics

- Wrap every outbound buy link in `/go/[id]` so we can swap registrars later.
- Append the registrar affiliate ref (`?ref=...`) before redirecting.
- Server-side log click events: `domain`, `tld`, `firstYearPrice`, `renewalPrice`, `ts`.
- Store clicks somewhere boring (Postgres table or a Plausible/PostHog event).
- Render a tiny "popular today" rail on `/drop` from click counts.
- Decide: PostHog Cloud vs Plausible vs roll-our-own SQL count.
- Env vars to add: `POSTHOG_KEY`, `PORKBUN_AFFILIATE_REF`, `NAMECHEAP_AFFILIATE_REF`.

## Phase 4 smart search

From the original spec.

- Idea-based name generation
  - Word combo generator (noun + noun, verb + noun, etc.)
  - Synonym expansion using a small embedded thesaurus.
  - Adjective-flavored generation per "mode".
- Better domain scoring
  - Score: length, vowel/consonant ratio, dictionary feel, brandability,
    renewal-spike penalty, brand-conflict penalty.
  - Surface a single "best pick" per search.
- Categories / search modes
  - African founder mode (relevant TLDs, .africa, .ng, .ke, etc.)
  - Creator mode (.studio, .me, .blog)
  - Startup mode (.ai, .so, .io fallbacks)
  - Newsletter mode (.email, .news, .press, .pub)
- Shortlist / save list
  - Anonymous local-storage list, optionally claimable with email.

## Nice-to-have

- Live RDAP cache via Redis/KV so popular searches are instant.
- Background job: nightly pricing refresh (cron) writing into Supabase / Neon.
- Receipt PDF download per domain.
- "Sold receipts" wall: redacted receipts of domains people actually bought.
