import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Free 2-minute quiz: build a real estate team or become a broker of record"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Free 2-Minute Quiz",
    title: "Build a Team or Become a Broker?",
    cta: "Take the Free Quiz →",
    note: "Find your real estate leadership path",
  })
}
