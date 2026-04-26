import type { DomainNote } from "@/lib/domain/notes"
import type { Availability } from "@/lib/domain/rdap"

export type DomainResult = {
  domain: string
  sld: string
  tld: string
  availability: Availability
  firstYearPrice: number
  renewalPrice: number
  registrar: string
  buyUrl: string
  notes: DomainNote[]
  isAbsoluteCheap: boolean
}

export type ParsedQuery =
  | { type: "exact"; sld: string; tld: string }
  | { type: "name"; sld: string }

