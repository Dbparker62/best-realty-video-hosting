"use client"

import Link from "next/link"
import type { Lesson } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Lock, Play, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonListProps {
  lessons: Lesson[]
  courseId: string
  hasPurchased: boolean
  currentLessonId?: string
}

export function LessonList({
  lessons,
  courseId,
  hasPurchased,
  currentLessonId,
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

        return (
          <div
            key={lesson.id}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors",
              isActive && "bg-primary/5",
              access !== "locked" && "hover:bg-muted/50"
            )}
          >
            {/* Lesson Number */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : access === "locked"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
              )}
            >
              {index + 1}
            </div>

            {/* Lesson Info */}
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
              </div>
            </div>

            {/* Action Button */}
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
                    Watch
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
