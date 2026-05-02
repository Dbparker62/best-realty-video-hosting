import type { Course, Lesson, PurchasedCourse, VideoUrl } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

function getAccessToken(): string | null {
  return localStorage.getItem("access_token")
}

function authHeaders(): HeadersInit {
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

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses`)

  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }

  return response.json()
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const courses = await getCourses()
  return courses.find((course) => course.id === courseId) || null
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch lessons")
  }

  return response.json()
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

  const data = await response.json()

  return {
    checkoutUrl: data.checkout_url,
  }
}

export async function getMyCourses(): Promise<PurchasedCourse[]> {
  const response = await fetch(`${API_BASE_URL}/my-courses`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch your courses")
  }

  return response.json()
}

export async function getLessonVideoUrl(lessonId: string): Promise<VideoUrl> {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/video-url`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to get video URL")
  }

  const data = await response.json()

  return {
    url: data.video_url,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  }
}

export async function hasPurchasedCourse(courseId: string): Promise<boolean> {
  const myCourses = await getMyCourses()
  return myCourses.some((course) => course.id === courseId)
}