"use client"

import Link from "next/link"
import type { PurchasedCourse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, User, Play, CheckCircle } from "lucide-react"

interface ProgressCardProps {
  course: PurchasedCourse
}

export function ProgressCard({ course }: ProgressCardProps) {
  const isCompleted = course.progress === 100

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-card-foreground">
            {course.title}
          </h3>
          {isCompleted && (
            <Badge className="shrink-0 bg-accent text-accent-foreground">
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
        {course.instructor && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{course.instructor}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <Button className="w-full" asChild>
          <Link
            href={
              course.lastWatchedLessonId
                ? `/courses/${course.id}/lessons/${course.lastWatchedLessonId}`
                : `/courses/${course.id}`
            }
          >
            <Play className="mr-2 h-4 w-4" />
            {isCompleted ? "Review Course" : "Continue Learning"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
