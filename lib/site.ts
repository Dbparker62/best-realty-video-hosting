import type { Metadata } from "next"

/**
 * Brand, domain and contact details — the one place to change them.
 * Moving to a new domain? Set NEXT_PUBLIC_SITE_URL in Vercel (and see DOMAIN_CHANGE.md).
 */

/** Canonical origin. The bare domain 308-redirects here, so all URLs use www. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bestacademyofrealestate.com"
).replace(/\/$/, "")

export const SITE_NAME = "Best School of Real Estate"

/** The school's main website. Course links use ONLINE_COURSES_URL instead. */
export const SCHOOL_WEBSITE_URL = (
  process.env.NEXT_PUBLIC_SCHOOL_WEBSITE_URL ?? "https://bestschoolofrealestate.biz"
).replace(/\/$/, "")

/** Online salesperson pre-licensing classes (RECampus store). */
export const ONLINE_COURSES_URL =
  process.env.NEXT_PUBLIC_ONLINE_COURSES_URL ??
  "https://home.recampus.com/shop/bestschool/real-estate-licensing/state-level?level=SALESPRSN_LICENSING&licenseType=SLP&orgCode=RE_LIC_NJ&productGroup=RE_WHOLESALE"

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

export const SITE_DESCRIPTION =
  "Get your New Jersey real estate license with Best School of Real Estate. " +
  "Take the free 2-minute career quiz to see if a real estate career is right for you."

/** Official social profiles — shown in the footer and listed in Google's structured data. */
export const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "Facebook", href: "https://www.facebook.com/106307004679499" },
  { label: "X", href: "https://x.com/BestSchoolOfRe1" },
]

/**
 * Per-page metadata with a canonical URL and matching Open Graph tags.
 * (A child's `openGraph` replaces the parent's, so siteName etc. are repeated here.)
 */
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

/** For pages that should never appear in search results (accounts, checkout, admin). */
export const NO_INDEX: Metadata = { robots: { index: false, follow: false } }
