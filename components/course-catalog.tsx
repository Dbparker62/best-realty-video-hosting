"use client"

import Link from "next/link"
import { useCallback } from "react"
import useSWR from "swr"
import { getCourses, initiateCheckout, getMyCourses } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { CourseCard } from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Award, Building2, GraduationCap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course } from "@/lib/types"

const STATS = [
  { icon: Building2, value: "20+", label: "Years of Experience" },
  { icon: GraduationCap, value: "1000+", label: "Students Enrolled" },
  { icon: TrendingUp, value: "95%", label: "Pass Rate" },
  { icon: Award, value: "50+", label: "Hours of Content" },
]

/** Hero + course grid. `initialCourses` comes from the server so the list is in the page HTML. */
export function CourseCatalog({ initialCourses }: { initialCourses?: Course[] }) {
  const { canUseCustomerFeatures } = useAuth()
  
  const { data: courses } = useSWR("courses", getCourses, {
    fallbackData: initialCourses,
  })
  
  const { data: myCourses } = useSWR(
    canUseCustomerFeatures ? "my-courses" : null,
    getMyCourses
  )

  const purchasedIds = new Set(myCourses?.map((c) => c.id) || [])

  const handleBuyCourse = useCallback(async (courseId: string) => {
    try {
      const { checkoutUrl } = await initiateCheckout(courseId)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Checkout failed:", error)
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.07] via-card to-card">
        {/* Soft background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              New Jersey Real Estate Pre-Licensing
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master the{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                New Jersey
              </span>{" "}
              Real Estate Exam
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Expert-led video courses designed for New Jersey real estate pre-licensing. 
              Learn property valuation, market analysis, negotiation strategies, and more.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                <Link href="/questionnaire">
                  Take the readiness quiz
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-background/80 px-8 text-base">
                <a href="#courses">Browse Courses</a>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section id="courses" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Available Courses
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose from our selection of professional real estate courses
            </p>
          </div>

          {!courses ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4 rounded-xl border p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <Skeleton className="h-8 w-16" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onBuy={() => handleBuyCourse(course.id)}
                  isPurchased={purchasedIds.has(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
