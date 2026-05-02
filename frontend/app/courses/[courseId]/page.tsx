"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { getCourse, getCourseLessons, initiateCheckout, hasPurchasedCourse } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { LessonList } from "@/components/lesson-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, User, CheckCircle } from "lucide-react"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = useMemo(() => {
    const raw = params?.courseId
    return Array.isArray(raw) ? raw[0] : raw
  }, [params])
  const { isAuthenticated } = useAuth()

  const { data: course, isLoading: courseLoading } = useSWR(
    courseId ? ["course", courseId] : null,
    () => getCourse(courseId as string)
  )

  const { data: lessons, isLoading: lessonsLoading } = useSWR(
    courseId ? ["lessons", courseId] : null,
    () => getCourseLessons(courseId as string)
  )

  const { data: purchased } = useSWR(
    isAuthenticated && courseId ? ["purchased", courseId] : null,
    () => hasPurchasedCourse(courseId as string)
  )

  const handleBuyCourse = useCallback(async () => {
    if (!courseId) return
    try {
      const { checkoutUrl } = await initiateCheckout(courseId)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Checkout failed:", error)
    }
  }, [courseId])

  if (!courseId) {
    return null
  }

  if (courseLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-6 h-6 w-1/2" />
        <Skeleton className="mb-8 h-24 w-full" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Browse Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const firstLessonId = lessons?.length
    ? [...lessons].sort((a, b) => a.order - b.order)[0]?.id
    : undefined

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {!course.published && (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
                {purchased && (
                  <Badge className="bg-accent text-accent-foreground">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Purchased
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>

              {course.instructor && (
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Taught by {course.instructor}</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {course.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.lessonCount != null && course.lessonCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessonCount} lessons</span>
                  </div>
                )}
              </div>

              <p className="mt-6 text-muted-foreground">{course.description}</p>
            </div>

            {/* Price Card */}
            <div className="shrink-0 rounded-xl border bg-background p-6 lg:w-72">
              <div className="mb-4 text-center">
                <span className="text-3xl font-bold text-foreground">
                  ${course.price}
                </span>
                <span className="text-muted-foreground">/lifetime</span>
              </div>

              {purchased ? (
                firstLessonId ? (
                  <Button className="w-full" asChild>
                    <Link
                      href={`/courses/${courseId}/lessons/${firstLessonId}`}
                    >
                      Start Learning
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    No lessons yet
                  </Button>
                )
              ) : (
                <Button
                  className="w-full"
                  onClick={handleBuyCourse}
                  disabled={!course.published}
                >
                  {course.published ? "Buy Now" : "Coming Soon"}
                </Button>
              )}

              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  All future updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Course Content
        </h2>

        {lessonsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : lessons && lessons.length > 0 ? (
          <LessonList
            lessons={lessons}
            courseId={courseId}
            hasPurchased={!!purchased}
          />
        ) : (
          <div className="rounded-xl border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              {isAuthenticated
                ? "Lesson content is being prepared. Check back soon!"
                : "Sign in to view the lesson list for this course."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
