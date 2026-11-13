import type { Metadata } from "next"
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bestrealtynewjersey.org").replace(/\/$/, "")
export const SITE_NAME = "Best Realty New Jersey"
export const SITE_DESCRIPTION = "Preparing to sell your New Jersey home? Get your free home sale readiness score, top priorities, and a practical plan with Best Realty New Jersey."
export const QUIZ_PATH = "/questionnaire/home-sale"
export const CONTACT = {
  phone: "(732) 266-3366",
  phoneHref: "tel:+17322663366",
  email: "bruceparkerteam@gmail.com",
  address: {
    street: "42 Woodbridge Avenue",
    city: "Highland Park",
    region: "NJ",
    postalCode: "08904",
  },
} as const

export const CONTACT_ADDRESS_LINE = `${CONTACT.address.street}, ${CONTACT.address.city}, ${CONTACT.address.region} ${CONTACT.address.postalCode}`

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string | { absolute: string }
  description: string
  path: string
}): Metadata {
  const ogTitle = typeof title === "string" ? title : title.absolute
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: ogTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  }
}

