import type { Metadata } from "next"
import { SearchClient } from "@/app/search/search-client"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  if (!query) {
    return {
      title: "search",
      description: "Search any idea and find cheap available domains around $2.",
    }
  }

  return {
    title: `search · ${query}`,
    description: `Cheap available domains for "${query}". Live availability, renewal price always shown.`,
    alternates: {
      canonical: `/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      title: `search · ${query}`,
      description: `Cheap available domains for "${query}".`,
    },
    twitter: {
      card: "summary_large_image",
      title: `search · ${query}`,
      description: `Cheap available domains for "${query}".`,
    },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const initialQuery = q?.trim() ?? ""
  return <SearchClient key={initialQuery} initialQuery={initialQuery} />
}