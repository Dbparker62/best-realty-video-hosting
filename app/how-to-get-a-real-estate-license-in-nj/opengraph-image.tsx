import { OG_SIZE, renderOgImage } from "@/lib/og-image"

export const alt = "How to get your New Jersey real estate license: step-by-step guide"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return renderOgImage({
    eyebrow: "Step-by-Step Guide",
    title: "How to Get Your NJ Real Estate License",
    cta: "Read the Free Guide →",
    note: "Requirements, the 75-hour course, the exam & more",
  })
}
