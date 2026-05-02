import type { Course, Lesson, PurchasedCourse, User, VideoUrl } from "./types"

/**
 * Use `NEXT_PUBLIC_API_URL=/api` with the Next.js rewrite (see next.config.mjs) to avoid
 * browser CORS when the API does not send Access-Control-* headers.
 * Otherwise default to calling the FastAPI server directly.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "")

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken()

  if (!token) {
    return {
      "Content-Type": "application/json",
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export function normalizeCognitoGroups(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((g) => String(g))
  }
  if (typeof raw === "string" && raw.length > 0) {
    return [raw]
  }
  return []
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/** Raw FastAPI / Dynamo-style course payload */
export interface CourseApi {
  id: string
  title: string
  description?: string | null
  price_cents: number
  owner_id?: string
  is_published?: boolean
}

/** Raw lesson payload */
interface LessonApi {
  id: string
  course_id: string
  title: string
  description?: string | null
  order_index: number
  duration_seconds?: number | null
  is_preview?: boolean
  is_published?: boolean
}

export function mapCourseFromApi(raw: CourseApi): Course {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ""),
    description: raw.description != null ? String(raw.description) : "",
    price: (Number(raw.price_cents) || 0) / 100,
    published: Boolean(raw.is_published),
  }
}

export function mapLessonFromApi(raw: LessonApi): Lesson {
  const durationSeconds = raw.duration_seconds
  return {
    id: String(raw.id),
    courseId: String(raw.course_id),
    title: String(raw.title ?? ""),
    description: raw.description != null ? String(raw.description) : "",
    order: Number(raw.order_index ?? 0),
    duration:
      durationSeconds != null && durationSeconds >= 0
        ? formatDuration(durationSeconds)
        : "—",
    isPreview: Boolean(raw.is_preview),
  }
}

export async function fetchAuthMe(): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as {
    sub?: string
    email?: string
    username?: string
    groups?: unknown
  }

  const email = data.email ?? ""
  const name =
    data.username?.trim() ||
    (email ? email.split("@")[0] : "") ||
    "Student"

  return {
    id: String(data.sub ?? ""),
    email,
    name,
    groups: normalizeCognitoGroups(data.groups),
  }
}

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses`)

  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }

  const data = (await response.json()) as CourseApi[]
  return data.map(mapCourseFromApi)
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const courses = await getCourses()
  return courses.find((course) => course.id === courseId) ?? null
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    headers: authHeaders(),
  })

  if (response.status === 401 || response.status === 403) {
    return []
  }

  if (!response.ok) {
    throw new Error("Failed to fetch lessons")
  }

  const data = (await response.json()) as LessonApi[]
  return data.map(mapLessonFromApi)
}

export async function initiateCheckout(
  courseId: string
): Promise<{ checkoutUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/checkout/${courseId}`, {
    method: "POST",
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to initiate checkout")
  }

  const data = (await response.json()) as { checkout_url: string }

  return {
    checkoutUrl: data.checkout_url,
  }
}

/**
 * When GET /my-courses exists on the API, returns server data.
 * Otherwise derives purchased courses by probing video access (no backend change required).
 */
export async function getMyCourses(): Promise<PurchasedCourse[]> {
  const response = await fetch(`${API_BASE_URL}/my-courses`, {
    headers: authHeaders(),
  })

  if (response.status === 404 || response.status === 501) {
    return getMyCoursesDerived()
  }

  if (!response.ok) {
    throw new Error("Failed to fetch your courses")
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((item: CourseApi & Partial<PurchasedCourse>) => ({
    ...mapCourseFromApi(item),
    progress: Number(item.progress) || 0,
    completedLessons: Number(item.completedLessons) || 0,
    totalLessons: Number(item.totalLessons) || 0,
    lastWatchedLessonId: item.lastWatchedLessonId,
  }))
}

async function getMyCoursesDerived(): Promise<PurchasedCourse[]> {
  const courses = await getCourses()
  const result: PurchasedCourse[] = []

  for (const c of courses) {
    const purchased = await hasPurchasedCourse(c.id)
    if (!purchased) continue

    const lessons = await getCourseLessons(c.id)
    result.push({
      ...c,
      progress: 0,
      completedLessons: 0,
      totalLessons: lessons.length,
    })
  }

  return result
}

async function canFetchLessonVideo(lessonId: string): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/video-url`,
    {
      headers: authHeaders(),
    }
  )

  return response.ok
}

/**
 * Uses lesson video access as purchase signal when /my-courses is unavailable.
 */
export async function hasPurchasedCourse(courseId: string): Promise<boolean> {
  const lessons = await getCourseLessons(courseId)
  if (lessons.length === 0) {
    return false
  }

  const sorted = [...lessons].sort((a, b) => a.order - b.order)
  const firstPaid =
    sorted.find((l) => !l.isPreview) ?? sorted[0]

  return canFetchLessonVideo(firstPaid.id)
}

export async function getLessonVideoUrl(lessonId: string): Promise<VideoUrl> {
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/video-url`,
    {
      headers: authHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to get video URL")
  }

  const data = (await response.json()) as { video_url?: string }

  return {
    url: data.video_url ?? "",
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  }
}
