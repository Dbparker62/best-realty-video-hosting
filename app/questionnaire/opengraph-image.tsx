import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Free New Jersey real estate career quiz"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Free 4-Question Quiz",
    title: "Is a Real Estate Career Right for You?",
    cta: "Get your NJ licensing roadmap →",
  })
}
