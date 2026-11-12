import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"
import { fetchPublicCourses } from "@/lib/server-courses"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/questionnaire", priority: 0.9, changeFrequency: "monthly" },
    { path: "/how-to-get-a-real-estate-license-in-nj", priority: 0.9, changeFrequency: "monthly" },
    { path: "/questionnaire/leadership", priority: 0.8, changeFrequency: "monthly" },
    { path: "/questionnaire/home-sale", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
    { path: "/refund", priority: 0.2, changeFrequency: "yearly" },
  ]

  const courses = (await fetchPublicCourses()) ?? []

  return [
    ...pages.map((p) => ({
      url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...courses.map((c) => ({
      url: `${SITE_URL}/courses/${encodeURIComponent(c.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
