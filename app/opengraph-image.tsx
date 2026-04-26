import { ImageResponse } from "next/og"

export const alt =
  "2dollardomain — find the domain before the motivation leaves"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
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
          gap: 36,
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
          <span>receipt</span>
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
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#161513",
            display: "flex",
          }}
        >
          find the domain before the motivation leaves.
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#6f6b63",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          cheap available domains around $2. real renewal price shown before you
          buy.
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
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
          }}
        >
          <span style={{ color: "#6f6b63" }}>powered by porkbun + rdap</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#2fbf71",
              background: "#e8f8ef",
              border: "2px solid #2fbf71",
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            $2-ish
          </span>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
