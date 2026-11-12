import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Free quiz: how ready is your New Jersey home to sell?"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Free Seller Quiz",
    title: "How Ready Is Your Home to Sell?",
    cta: "Get My Readiness Score →",
    note: "Plus your top priorities before you list"
  })
}
