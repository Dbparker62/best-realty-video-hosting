"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import {
  getCourse,
  getCourseLessons,
  getLessonVideoUrl,
  hasPurchasedCourse,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { VideoPlayer } from "@/components/video-player"
import { LessonSidebar } from "@/components/lesson-sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from "lucide-react"
import type { Lesson } from "@/lib/types"

export default function LessonPlayerPage() {
  const params = useParams()
  const courseId = useMemo(() => {
    const raw = params?.courseId
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])
  const lessonId = useMemo(() => {
    const raw = params?.lessonId
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])

  const { canUseCustomerFeatures } = useAuth()

  const { data: course } = useSWR(
    courseId ? ["course", courseId] : null,
    () => getCourse(courseId as string)
  )

  const { data: lessons, isLoading: lessonsLoading } = useSWR(
    courseId ? ["lessons", courseId] : null,
    () => getCourseLessons(courseId as string)
  )

  const { data: purchased } = useSWR(
    canUseCustomerFeatures && courseId ? ["purchased", courseId] : null,
    () => hasPurchasedCourse(courseId as string)
  )

  const currentLesson = useMemo(
    () => lessons?.find((l) => l.id === lessonId),
    [lessons, lessonId]
  )

  const canAccess = Boolean(
    currentLesson && (currentLesson.isPreview || purchased)
  )

  const { data: videoData, isLoading: videoLoading } = useSWR(
    canAccess && lessonId ? ["video", lessonId] : null,
    () => getLessonVideoUrl(lessonId as string)
  )

  const sortedLessons = useMemo(
    () => [...(lessons || [])].sort((a, b) => a.order - b.order),
    [lessons]
  )

  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null

  const canAccessLesson = (lesson: Lesson | null) => {
    if (!lesson) return false
    return lesson.isPreview || !!purchased
  }

  if (!courseId || !lessonId) {
    return null
  }

  if (lessonsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="mt-6 h-8 w-3/4" />
            <Skeleton className="mt-4 h-20 w-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!currentLesson) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">Lesson Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This lesson doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/courses/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{course?.title || "Back to Course"}</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {prevLesson && canAccessLesson(prevLesson) && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Link>
              </Button>
            )}
            {nextLesson && canAccessLesson(nextLesson) && (
              <Button size="sm" asChild>
                <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Video Area */}
          <div>
            {canAccess ? (
              videoLoading ? (
                <Skeleton className="aspect-video w-full rounded-xl" />
              ) : videoData?.url ? (
                <VideoPlayer
                  videoUrl={videoData.url}
                  title={currentLesson.title}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                  <p className="text-muted-foreground">
                    Video unavailable. Please try again later.
                  </p>
                </div>
              )
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-muted">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted-foreground/20">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  This lesson is locked
                </h3>
                <p className="mt-2 text-center text-muted-foreground">
                  Purchase this course to unlock all lessons.
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/courses/${courseId}`}>View Course</Link>
                </Button>
              </div>
            )}

            {/* Lesson Info */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-foreground">
                {currentLesson.title}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {currentLesson.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden h-[calc(100vh-200px)] lg:block">
            <LessonSidebar
              lessons={lessons || []}
              courseId={courseId}
              currentLessonId={lessonId}
              hasPurchased={!!purchased}
            />
          </div>
        </div>

        {/* Mobile Lesson List */}
        <div className="mt-8 lg:hidden">
          <h3 className="mb-4 font-semibold text-foreground">Course Content</h3>
          <LessonSidebar
            lessons={lessons || []}
            courseId={courseId}
            currentLessonId={lessonId}
            hasPurchased={!!purchased}
          />
        </div>
      </div>
    </div>
  )
}
