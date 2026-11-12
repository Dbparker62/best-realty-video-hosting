import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

/** Link-preview image (Facebook, iMessage, LinkedIn, X…) — 1200×630, school colors + logo. */
export const OG_SIZE = { width: 1200, height: 630 }

const MAROON = "#8a0c31" // logo color
const RED = "#d22f25" // bestschoolofrealestate.biz buttons
const CHARCOAL = "#303030"

async function logoDataUri(): Promise<string> {
  const bytes = await readFile(join(process.cwd(), "public", "school-logo.jpg"))
  return `data:image/jpeg;base64,${bytes.toString("base64")}`
}

/** Montserrat, the heading font on bestschoolofrealestate.biz. */
async function loadFonts() {
  const dir = join(process.cwd(), "assets", "fonts")
  const [semi, extra] = await Promise.all([
    readFile(join(dir, "Montserrat-SemiBold.ttf")),
    readFile(join(dir, "Montserrat-ExtraBold.ttf")),
  ])
  return [
    { name: "Montserrat", data: semi, weight: 600 as const, style: "normal" as const },
    { name: "Montserrat", data: extra, weight: 800 as const, style: "normal" as const },
  ]
}

export async function renderOgImage({
  eyebrow,
  title,
  cta,
  note,
}: {
  eyebrow: string
  title: string
  cta: string
  note?: string
}) {
  const [logo, fonts] = await Promise.all([logoDataUri(), loadFonts()])
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          fontFamily: "Montserrat",
        }}
      >
        {/* Maroon side band with the logo */}
        <div
          style={{
            width: 360,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: MAROON,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#ffffff",
              borderRadius: 24,
              padding: 22,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={250} height={191} alt="" />
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 800,
              color: RED,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
              color: CHARCOAL,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 36,
              fontSize: 30,
              fontWeight: 800,
              color: "#ffffff",
              background: RED,
              padding: "16px 34px",
              borderRadius: 999,
            }}
          >
            {cta}
          </div>
          {note && (
            <div style={{ display: "flex", marginTop: 26, fontSize: 22, fontWeight: 600, color: "#6b6b6b" }}>
              {note}
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
