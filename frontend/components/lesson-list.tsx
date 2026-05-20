"use client"

import Link from "next/link"
import type { Lesson } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Lock, Play, Eye, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonListProps {
  lessons: Lesson[]
  courseId: string
  hasPurchased: boolean
  currentLessonId?: string
  completedLessonIds?: Set<string>
}

export function LessonList({
  lessons,
  courseId,
  hasPurchased,
  currentLessonId,
  completedLessonIds,
}: LessonListProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  const getLessonAccess = (lesson: Lesson) => {
    if (lesson.isPreview) return "preview"
    if (hasPurchased) return "watch"
    return "locked"
  }

  return (
    <div className="divide-y divide-border rounded-xl border bg-card">
      {sortedLessons.map((lesson, index) => {
        const access = getLessonAccess(lesson)
        const isActive = currentLessonId === lesson.id
        const isCompleted = completedLessonIds?.has(lesson.id)

        return (
          <div
            key={lesson.id}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors",
              isActive && "bg-primary/5",
              access !== "locked" && "hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
                isCompleted
                  ? "bg-accent text-accent-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground"
                    : access === "locked"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "truncate font-medium",
                  access === "locked"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {lesson.title}
              </h4>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.duration}
                </span>
                {isCompleted && (
                  <span className="rounded bg-accent/20 px-1.5 text-xs text-accent">
                    Completed
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {access === "locked" ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
              ) : access === "preview" ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                    <Eye className="mr-1.5 h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                    <Play className="mr-1.5 h-4 w-4" />
                    {isCompleted ? "Review" : "Watch"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
