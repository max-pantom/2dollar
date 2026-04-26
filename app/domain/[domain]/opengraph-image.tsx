import { ImageResponse } from "next/og"

import { searchDomain } from "@/lib/domain/search"

export const alt = "2dollardomain receipt"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: { domain: string }
}) {
  const decoded = decodeURIComponent(params.domain).toLowerCase()
  const { results } = await searchDomain(decoded)
  const result = results[0]

  const isAvailable = result?.availability === "available"
  const availabilityLabel = result?.availability ?? "unknown"
  const firstYear = result && result.firstYearPrice > 0
  const renewal =
    result && Number.isFinite(result.renewalPrice) && result.renewalPrice > 0

  const tagBg = isAvailable ? "#e8f8ef" : "#f1ede4"
  const tagBorder = isAvailable ? "#2fbf71" : "#e7dfd2"
  const tagColor = isAvailable ? "#2fbf71" : "#6f6b63"

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
          gap: 30,
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
          <span>receipt #{Math.abs(hashString(decoded)) % 999}</span>
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
            fontSize: 78,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#161513",
            display: "flex",
          }}
        >
          {result?.domain ?? decoded}
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 26,
              color: tagColor,
              background: tagBg,
              border: `2px solid ${tagBorder}`,
              borderRadius: 4,
              padding: "6px 14px",
            }}
          >
            {availabilityLabel}
          </span>
          {firstYear && result.firstYearPrice <= 2.5 ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 26,
                color: "#2fbf71",
                background: "#e8f8ef",
                border: "2px solid #2fbf71",
                borderRadius: 4,
                padding: "6px 14px",
              }}
            >
              $2-ish
            </span>
          ) : null}
        </div>
        {firstYear ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
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
              <span style={{ color: "#6f6b63" }}>first year</span>
              <span>${result.firstYearPrice.toFixed(2)}</span>
            </div>
            {renewal ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#6f6b63" }}>renews yearly</span>
                <span>${result.renewalPrice.toFixed(2)}</span>
              </div>
            ) : null}
            {result.registrar ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#6f6b63" }}>registrar</span>
                <span>{result.registrar}</span>
              </div>
            ) : null}
          </div>
        ) : null}
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
          find the domain before the motivation leaves — 2dollardomain
        </div>
      </div>
    </div>,
    { ...size }
  )
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash
}
