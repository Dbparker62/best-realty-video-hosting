import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "Free 2-minute quiz: is a real estate career right for you?"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Free 2-Minute Quiz",
    title: "Is Real Estate Right for You?",
    cta: "Take the Free Quiz →",
    note: "Get your personalized NJ licensing roadmap",
  })
}
