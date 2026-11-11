import { ImageResponse } from "next/og"
import { SITE_NAME } from "./site"

/** Link-preview image (Facebook, iMessage, LinkedIn, X…) — 1200×630. */
export const OG_SIZE = { width: 1200, height: 630 }

export function renderOgImage({ eyebrow, title, cta }: { eyebrow: string; title: string; cta: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #1f3b5c 0%, #0f2238 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, opacity: 0.85 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#9ec5f0", marginBottom: 20 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            fontSize: 30,
            fontWeight: 600,
            background: "#ffffff",
            color: "#1f3b5c",
            padding: "16px 32px",
            borderRadius: 12,
          }}
        >
          {cta}
        </div>
      </div>
    ),
    OG_SIZE
  )
}
