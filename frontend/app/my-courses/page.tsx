"use client"

import Link from "next/link"
import useSWR from "swr"
import { getMyCourses } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProgressCard } from "@/components/progress-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { BookOpen, ArrowRight } from "lucide-react"

export default function MyCoursesPage() {
  const { isAuthenticated } = useAuth()

  const { data: courses, isLoading } = useSWR(
    isAuthenticated ? "my-courses" : null,
    getMyCourses
  )

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Sign in to view your courses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Access your purchased courses and track your progress.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Click the Login button in the header to sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Courses
          </h1>
          <p className="mt-2 text-muted-foreground">
            Continue learning where you left off
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 rounded-xl border p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mt-4 h-10 w-full" />
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <>
            {/* Stats Summary */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.filter((c) => c.progress === 100).length}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.filter((c) => c.progress > 0 && c.progress < 100).length}
                </p>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <ProgressCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <Empty
            icon={BookOpen}
            title="No courses yet"
            description="Browse our catalog and start your real estate education journey."
          >
            <Button asChild>
              <Link href="/">
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Empty>
        )}
      </div>
    </div>
  )
}
