import { Sticker } from "@/components/sticker"

export function RenewalWarning({
  firstYearPrice,
  renewalPrice,
}: {
  firstYearPrice: number
  renewalPrice: number | null
}) {
  if (renewalPrice === null || !Number.isFinite(renewalPrice)) {
    return <Sticker tone="muted">renewal unknown</Sticker>
  }

  if (firstYearPrice <= 0) {
    return null
  }

  const multiplier = renewalPrice / firstYearPrice

  if (multiplier >= 5) {
    return <Sticker tone="warning">cheap today, spicy later</Sticker>
  }

  return <Sticker tone="muted">good renewal</Sticker>
}
