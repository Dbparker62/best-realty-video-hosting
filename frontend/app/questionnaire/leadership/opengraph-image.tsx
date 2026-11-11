import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Free quiz: build a real estate team or become a broker of record"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Free 5-Question Quiz",
    title: "Build a Team or Become a Broker?",
    cta: "Find your leadership path →",
  })
}
