import { ImageResponse } from "next/og"

import { searchDomain } from "@/lib/domain/search"

export const alt = "2dollardomain search receipt"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"

type Props = {
  searchParams?: Promise<{ q?: string }>
}

export default async function Image({ searchParams }: Props) {
  const params = (await searchParams) ?? {}
  const query = (params.q ?? "").trim()

  const { results } = query ? await searchDomain(query) : { results: [] }
  const available = results.filter((item) => item.availability === "available")
  const cheapest = available[0]

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#faf7f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          width: 960,
          background: "#ffffff",
          border: "2px solid #161513",
          borderRadius: 4,
          padding: 60,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#6f6b63",
          }}
        >
          <span>2dollardomain</span>
          <span>search receipt</span>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "2px dashed #e7dfd2",
            height: 0,
          }}
        />
        <div
          style={{
            fontSize: 30,
            color: "#6f6b63",
            display: "flex",
          }}
        >
          you searched
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#161513",
            display: "flex",
          }}
        >
          {query || "—"}
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "2px dashed #e7dfd2",
            height: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 28,
            color: "#161513",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#6f6b63" }}>checked</span>
            <span>{results.length} TLDs</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#6f6b63" }}>available</span>
            <span style={{ color: "#2fbf71" }}>{available.length}</span>
          </div>
          {cheapest ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#6f6b63" }}>cheapest</span>
              <span>
                {cheapest.domain} · ${cheapest.firstYearPrice.toFixed(2)}
              </span>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "2px dashed #e7dfd2",
            height: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#6f6b63",
          }}
        >
          renewal price always shown — 2dollardomain
        </div>
      </div>
    </div>,
    { ...size }
  )
}
