import type {
  Course,
  CourseProgress,
  Lesson,
  LessonProgress,
  PurchasedCourse,
  User,
  VideoUrl,
} from "./types"

/**
 * Browser calls use `/api` (Next.js rewrite → API Gateway) to avoid CORS.
 * Override with NEXT_PUBLIC_API_URL only if you configure API Gateway CORS yourself.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") {
    return "/api"
  }
  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}/api`
  }
  return "https://36fjcwgqfc.execute-api.us-east-1.amazonaws.com"
}

export const API_BASE_URL = resolveApiBaseUrl()

export async function parseApiError(response: Response): Promise<string> {
  const text = await response.text()
  try {
    const data = JSON.parse(text) as {
      error?: { message?: string; code?: string; details?: unknown }
      detail?: { error?: { message?: string; code?: string } }
    }
    const nested = data.error ?? data.detail?.error
    if (nested?.message) {
      const code = nested.code ? `[${nested.code}] ` : ""
      return `${code}${nested.message}`
    }
  } catch {
    // not JSON
  }
  return text || `Request failed (${response.status})`
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

function getIdToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("id_token")
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken()
  const idToken = getIdToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (idToken) {
    headers["X-Id-Token"] = idToken
  }

  return headers
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

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!response.ok) return false

    const data = (await response.json()) as {
      access_token?: string
      id_token?: string
    }
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token)
    }
    if (data.id_token) {
      localStorage.setItem("id_token", data.id_token)
    }
    return Boolean(data.access_token)
  } catch {
    return false
  }
}

export async function fetchAuthMe(): Promise<User | null> {
  let response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders(),
      })
    }
  }

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

interface PurchasedCourseApi extends CourseApi {
  progress?: number
  completed_lessons?: number
  completedLessons?: number
  total_lessons?: number
  totalLessons?: number
  last_watched_lesson_id?: string | null
  lastWatchedLessonId?: string
}

function mapPurchasedCourseFromApi(item: PurchasedCourseApi): PurchasedCourse {
  return {
    ...mapCourseFromApi(item),
    progress: Number(item.progress) || 0,
    completedLessons:
      Number(item.completed_lessons ?? item.completedLessons) || 0,
    totalLessons: Number(item.total_lessons ?? item.totalLessons) || 0,
    lastWatchedLessonId:
      item.last_watched_lesson_id ?? item.lastWatchedLessonId ?? undefined,
  }
}

/** Enrolled courses from GET /my-courses (DynamoDB course access). */
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

  const data = (await response.json()) as PurchasedCourseApi[]
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(mapPurchasedCourseFromApi)
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

export async function confirmCheckout(sessionId: string): Promise<{
  courseId: string
  hasAccess: boolean
}> {
  const response = await fetch(`${API_BASE_URL}/checkout/confirm`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ session_id: sessionId }),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = (await response.json()) as {
    course_id: string
    has_access: boolean
  }

  return {
    courseId: data.course_id,
    hasAccess: Boolean(data.has_access),
  }
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

/** Checks DynamoDB course access (not whether a video file exists). */
export async function hasPurchasedCourse(courseId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/access`, {
    headers: authHeaders(),
  })

  if (response.ok) {
    const data = (await response.json()) as { has_access?: boolean }
    return Boolean(data.has_access)
  }

  if (response.status === 404 || response.status === 501) {
    const lessons = await getCourseLessons(courseId)
    if (lessons.length === 0) {
      return false
    }

    const sorted = [...lessons].sort((a, b) => a.order - b.order)
    const firstPaid = sorted.find((l) => !l.isPreview) ?? sorted[0]
    return canFetchLessonVideo(firstPaid.id)
  }

  return false
}

interface CourseProgressApi {
  course_id: string
  progress?: number
  completed_lessons?: number
  total_lessons?: number
  last_watched_lesson_id?: string | null
  lessons?: Array<{
    lesson_id: string
    completed?: boolean
    position_seconds?: number | null
    last_watched_at?: string | null
  }>
}

function mapCourseProgressFromApi(data: CourseProgressApi): CourseProgress {
  return {
    courseId: data.course_id,
    progress: Number(data.progress) || 0,
    completedLessons: Number(data.completed_lessons) || 0,
    totalLessons: Number(data.total_lessons) || 0,
    lastWatchedLessonId: data.last_watched_lesson_id ?? undefined,
    lessons: (data.lessons ?? []).map((row) => ({
      lessonId: row.lesson_id,
      completed: Boolean(row.completed),
      positionSeconds:
        row.position_seconds != null ? Number(row.position_seconds) : undefined,
      lastWatchedAt: row.last_watched_at ?? undefined,
    })),
  }
}

export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress | null> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
    headers: authHeaders(),
  })

  if (response.status === 401 || response.status === 403) {
    return null
  }

  if (response.status === 404) {
    return {
      courseId,
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
      lessons: [],
    }
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = (await response.json()) as CourseProgressApi
  return mapCourseProgressFromApi(data)
}

/** Mark one lesson complete — saves to your purchase row in DynamoDB. */
export async function markLessonComplete(
  courseId: string,
  lessonId: string
): Promise<CourseProgress> {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/complete`,
    {
      method: "POST",
      headers: authHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = (await response.json()) as CourseProgressApi
  return mapCourseProgressFromApi(data)
}

export async function updateLessonProgress(
  courseId: string,
  lessonId: string,
  payload: { completed?: boolean; positionSeconds?: number }
): Promise<CourseProgress> {
  const body: Record<string, unknown> = {}
  if (payload.completed === true) {
    body.completed = true
  }
  if (payload.positionSeconds != null) {
    body.position_seconds = payload.positionSeconds
  }

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/progress`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = (await response.json()) as CourseProgressApi
  return mapCourseProgressFromApi(data)
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
