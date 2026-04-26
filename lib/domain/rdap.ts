export type Availability = "available" | "taken" | "unknown"

export async function checkAvailability(domain: string): Promise<Availability> {
  const cleaned = domain.trim().toLowerCase()

  if (!/^[a-z0-9-]+\.[a-z0-9.-]+$/.test(cleaned)) {
    return "unknown"
  }

  try {
    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(cleaned)}`,
      {
        headers: { Accept: "application/rdap+json" },
        next: { revalidate: 60 * 30 },
      }
    )

    if (response.status === 404) {
      return "available"
    }

    if (response.status === 200) {
      return "taken"
    }

    return "unknown"
  } catch {
    return "unknown"
  }
}
