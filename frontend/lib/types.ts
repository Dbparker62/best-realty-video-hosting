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

export interface User {
  id: string
  email: string
  name: string
}

export interface VideoUrl {
  url: string
  expiresAt: string
}
