"use client"

import Link from "next/link"
import type { Lesson } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Play, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonSidebarProps {
  lessons: Lesson[]
  courseId: string
  currentLessonId: string
  hasPurchased: boolean
}

export function LessonSidebar({
  lessons,
  courseId,
  currentLessonId,
  hasPurchased,
}: LessonSidebarProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  const canAccess = (lesson: Lesson) => {
    return lesson.isPreview || (hasPurchased && !lesson.isLocked)
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold text-foreground">Course Content</h3>
        <p className="text-sm text-muted-foreground">
          {lessons.length} lessons
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {sortedLessons.map((lesson, index) => {
            const isActive = lesson.id === currentLessonId
            const accessible = canAccess(lesson)

            return (
              <Link
                key={lesson.id}
                href={
                  accessible
                    ? `/courses/${courseId}/lessons/${lesson.id}`
                    : "#"
                }
                className={cn(
                  "flex items-start gap-3 p-3 transition-colors",
                  isActive && "bg-primary/5",
                  accessible && !isActive && "hover:bg-muted/50",
                  !accessible && "cursor-not-allowed opacity-60"
                )}
                onClick={(e) => !accessible && e.preventDefault()}
              >
                {/* Lesson number/status */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : !accessible
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  )}
                >
                  {!accessible ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <Play className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Lesson info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {lesson.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.duration}</span>
                    {lesson.isPreview && (
                      <span className="rounded bg-accent/20 px-1 text-accent">
                        Preview
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
