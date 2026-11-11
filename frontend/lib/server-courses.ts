import type { Course } from "./types"

/**
 * Server-side course fetch for metadata, the sitemap and the initial HTML,
 * so search engines see the course list without running JavaScript.
 * Calls the backend directly (the /api rewrite is for browsers).
 */
const BACKEND_ORIGIN = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://api.bestacademyofrealestate.com"
).replace(/\/$/, "")

interface CourseApi {
  id: string
  title: string
  description?: string | null
  price_cents: number
  is_published?: boolean
}

/** Public course list, cached for 5 minutes. Returns null if the API is unreachable. */
export async function fetchPublicCourses(): Promise<Course[] | null> {
  try {
    const res = await fetch(`${BACKEND_ORIGIN}/courses`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = (await res.json()) as CourseApi[]
    return data.map((raw) => ({
      id: String(raw.id),
      title: String(raw.title ?? ""),
      description: raw.description != null ? String(raw.description) : "",
      price: (Number(raw.price_cents) || 0) / 100,
      published: Boolean(raw.is_published),
    }))
  } catch {
    return null
  }
}

export async function fetchPublicCourse(courseId: string): Promise<Course | null> {
  const courses = await fetchPublicCourses()
  return courses?.find((c) => c.id === courseId) ?? null
}
