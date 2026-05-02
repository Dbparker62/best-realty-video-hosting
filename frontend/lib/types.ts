export interface Course {
  id: string
  title: string
  description: string
  price: number
  published: boolean
  thumbnail?: string
  instructor?: string
  duration?: string
  lessonCount?: number
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  duration: string
  isPreview: boolean
}

export interface PurchasedCourse extends Course {
  progress: number
  completedLessons: number
  totalLessons: number
  lastWatchedLessonId?: string
}

/** Cognito groups from `/auth/me` (e.g. `admin`, `customer`). */
export interface User {
  id: string
  email: string
  name: string
  groups?: string[]
}

export interface VideoUrl {
  url: string
  expiresAt: string
}

export interface CourseFormData {
  title: string
  description: string
  price: number
  published: boolean
}

export interface AdminLesson extends Lesson {
  published: boolean
  videoKey?: string
}

export interface LessonFormData {
  title: string
  description: string
  order: number
  published: boolean
  isPreview: boolean
}

export interface Purchase {
  id: string
  courseId: string
  courseTitle: string
  userId: string
  userEmail: string
  amount: number
  purchasedAt: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  videoKey: string
}
