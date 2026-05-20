"use client"

import Link from "next/link"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, User } from "lucide-react"

interface CourseCardProps {
  course: Course
  onBuy?: () => void
  isPurchased?: boolean
}

export function CourseCard({ course, onBuy, isPurchased }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-card-foreground">
            {course.title}
          </h3>
          {!course.published && (
            <Badge variant="secondary" className="shrink-0">
              Coming Soon
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
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.lessonCount && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.lessonCount} lessons</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
        <span className="text-xl font-bold text-foreground">
          ${course.price}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.id}`}>View Course</Link>
          </Button>
          {isPurchased ? (
            <Button size="sm" asChild>
              <Link href={`/my-courses`}>Continue</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onBuy}
              disabled={!course.published}
            >
              Buy Course
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
