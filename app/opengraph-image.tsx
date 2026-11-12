import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Best School of Real Estate: New Jersey real estate licensing courses"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "New Jersey Real Estate School",
    title: "Get Your NJ Real Estate License",
    cta: "Take the Free 2-Minute Quiz →",
    note: "Licensed by the NJ Real Estate Commission",
  })
}
