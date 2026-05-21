import {
  API_BASE_URL,
  authHeaders,
  mapCourseFromApi,
  mapLessonFromApi,
  parseApiError,
  type CourseApi,
} from "./api"
import type {
  AdminLesson,
  AdminUsersResponse,
  Course,
  CourseFormData,
  LessonFormData,
  Purchase,
  UploadUrlResponse,
} from "./types"

/** Raw API lesson including admin fields */
interface LessonOutApi {
  id: string
  course_id: string
  title: string
  description?: string | null
  order_index: number
  duration_seconds?: number | null
  is_preview?: boolean
  is_published?: boolean
  video_s3_key?: string | null
}

function mapAdminLesson(raw: LessonOutApi): AdminLesson {
  const base = mapLessonFromApi(raw)
  return {
    ...base,
    published: Boolean(raw.is_published),
    videoKey: raw.video_s3_key ?? undefined,
  }
}

export async function getAdminCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as CourseApi[]
  return data.map((row) => mapCourseFromApi(row))
}

/**
 * Creates a course owned by the authenticated admin. `owner_id` is omitted so FastAPI
 * uses the Cognito `sub` from the Bearer token (see `POST /courses`).
 */
export async function createCourse(data: CourseFormData): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description || null,
      price_cents: Math.round(data.price * 100),
      is_published: data.published,
    }),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const row = (await response.json()) as CourseApi
  return mapCourseFromApi(row)
}

export async function updateCourse(
  courseId: string,
  data: Partial<CourseFormData>
): Promise<Course> {
  const body: Record<string, unknown> = {}
  if (data.title !== undefined) body.title = data.title
  if (data.description !== undefined) body.description = data.description
  if (data.price !== undefined) body.price_cents = Math.round(data.price * 100)
  if (data.published !== undefined) body.is_published = data.published

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const row = (await response.json()) as CourseApi
  return mapCourseFromApi(row)
}

export async function deleteCourse(courseId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}

export async function getAdminLessons(courseId: string): Promise<AdminLesson[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/courses/${courseId}/lessons`,
    {
      headers: authHeaders(),
    }
  )
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as LessonOutApi[]
  return data.map(mapAdminLesson)
}

export async function createLesson(
  courseId: string,
  data: LessonFormData
): Promise<AdminLesson> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      course_id: courseId,
      title: data.title,
      description: data.description || null,
      order_index: data.order,
      is_preview: data.isPreview,
      is_published: data.published,
    }),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const row = (await response.json()) as LessonOutApi
  return mapAdminLesson(row)
}

export async function updateLesson(
  lessonId: string,
  data: Partial<LessonFormData>
): Promise<AdminLesson> {
  const body: Record<string, unknown> = {}
  if (data.title !== undefined) body.title = data.title
  if (data.description !== undefined) body.description = data.description
  if (data.order !== undefined) body.order_index = data.order
  if (data.isPreview !== undefined) body.is_preview = data.isPreview
  if (data.published !== undefined) body.is_published = data.published

  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const row = (await response.json()) as LessonOutApi
  return mapAdminLesson(row)
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}

export async function getVideoUploadUrl(
  lessonId: string,
  filename: string
): Promise<UploadUrlResponse> {
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/video/upload-url`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        lesson_id: lessonId,
        filename,
        content_type: "video/mp4",
      }),
    }
  )
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as {
    upload_url: string
    video_s3_key: string
  }
  return {
    uploadUrl: data.upload_url,
    videoKey: data.video_s3_key,
  }
}

export async function saveVideoKey(
  lessonId: string,
  videoKey: string,
  durationSeconds?: number | null
): Promise<void> {
  const body: Record<string, unknown> = { video_s3_key: videoKey }
  if (
    durationSeconds != null &&
    Number.isFinite(durationSeconds) &&
    durationSeconds >= 0
  ) {
    body.duration_seconds = Math.round(durationSeconds)
  }
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/video`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}

interface PurchaseApiRow {
  id: string
  course_id: string
  course_title: string
  user_id: string
  user_email: string
  amount: number
  purchased_at: string
}

export async function getAdminPurchases(): Promise<Purchase[]> {
  const response = await fetch(`${API_BASE_URL}/admin/purchases`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const rows = (await response.json()) as PurchaseApiRow[]
  return rows.map((p) => ({
    id: p.id,
    courseId: p.course_id,
    courseTitle: p.course_title || "—",
    userId: p.user_id,
    userEmail: p.user_email || "—",
    amount: p.amount,
    purchasedAt: p.purchased_at,
  }))
}

interface RegisteredUserApi {
  id: string
  email: string
  full_name: string
  is_admin?: boolean
}

interface CustomerApi {
  user_id: string
  email: string
  purchase_count: number
  course_ids: string[]
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as {
    registered_users: RegisteredUserApi[]
    customers: CustomerApi[]
  }
  return {
    registeredUsers: (data.registered_users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.full_name,
      isAdmin: Boolean(u.is_admin),
    })),
    customers: (data.customers ?? []).map((c) => ({
      userId: c.user_id,
      email: c.email,
      purchaseCount: c.purchase_count,
      courseIds: c.course_ids ?? [],
    })),
  }
}
