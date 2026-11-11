import type { Metadata } from "next"

/** Canonical origin. The bare domain 308-redirects here, so all URLs use www. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bestacademyofrealestate.com"
).replace(/\/$/, "")

export const SITE_NAME = "Best Realty Courses"

export const SITE_DESCRIPTION =
  "Get your New Jersey real estate license with expert-led pre-licensing video courses. " +
  "Take the free 1-minute career quiz to see your path to becoming an NJ agent."

/**
 * Official social profiles (Instagram, YouTube, Facebook…). Listed in the
 * site's structured data so Google ties them to this site. Add full URLs.
 */
export const SOCIAL_LINKS: string[] = []

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
