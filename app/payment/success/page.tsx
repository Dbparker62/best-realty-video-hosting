"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, BookOpen } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course_id")

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
        <CheckCircle className="h-10 w-10 text-accent" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Payment Successful!
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">
        Your course is now available. Start learning right away and take your
        real estate career to the next level.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {courseId ? (
          <Button size="lg" asChild>
            <Link href={`/courses/${courseId}`}>
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link href="/my-courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Go to My Courses
            </Link>
          </Button>
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Browse More Courses</Link>
        </Button>
      </div>

      <div className="mt-12 rounded-xl border bg-card p-6 text-left">
        <h3 className="font-semibold text-foreground">What&apos;s next?</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Access all course lessons immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Track your progress as you learn</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>Get lifetime access to all updates</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
