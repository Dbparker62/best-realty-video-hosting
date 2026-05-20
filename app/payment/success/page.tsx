"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { mutate } from "swr"
import { confirmCheckout } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, BookOpen, Loader2, AlertCircle } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course_id")
  const sessionId = searchParams.get("session_id")
  const { isAuthenticated, isLoading: authLoading, canUseCustomerFeatures } =
    useAuth()

  const [status, setStatus] = useState<
    "idle" | "confirming" | "confirmed" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (authLoading || !isAuthenticated || !canUseCustomerFeatures) return
    if (!sessionId) {
      setStatus("confirmed")
      return
    }

    let cancelled = false

    const run = async () => {
      setStatus("confirming")
      setErrorMessage(null)
      try {
        const result = await confirmCheckout(sessionId)
        if (cancelled) return

        const resolvedCourseId = result.courseId || courseId
        if (resolvedCourseId) {
          await mutate(["purchased", resolvedCourseId], true, false)
          await mutate(["course-progress", resolvedCourseId])
          await mutate("my-courses")
        }

        setStatus("confirmed")
      } catch (err) {
        if (cancelled) return
        setStatus("error")
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Could not confirm your purchase. Try again in a moment."
        )
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    authLoading,
    isAuthenticated,
    canUseCustomerFeatures,
    sessionId,
    courseId,
    retryCount,
  ])

  const isWorking = status === "confirming" || authLoading

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
        {isWorking ? (
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        ) : status === "error" ? (
          <AlertCircle className="h-10 w-10 text-destructive" />
        ) : (
          <CheckCircle className="h-10 w-10 text-accent" />
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {isWorking
          ? "Activating your course…"
          : status === "error"
            ? "Almost there"
            : "Payment Successful!"}
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">
        {isWorking
          ? "We are confirming your payment and unlocking your lessons."
          : status === "error"
            ? errorMessage
            : "Your course is now available. Start learning right away and take your real estate career to the next level."}
      </p>

      {status === "error" && sessionId && (
        <Button
          className="mt-6"
          onClick={() => {
            setErrorMessage(null)
            setRetryCount((c) => c + 1)
          }}
        >
          Try again
        </Button>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {courseId && status === "confirmed" ? (
          <Button size="lg" asChild disabled={isWorking}>
            <Link href={`/courses/${courseId}`}>
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild disabled={isWorking}>
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

      {status === "confirmed" && (
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
      )}
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
