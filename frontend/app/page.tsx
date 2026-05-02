"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { getCourses, initiateCheckout, getMyCourses } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { CourseCard } from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, GraduationCap, TrendingUp, Award } from "lucide-react"

export default function CourseCatalog() {
  const { canUseCustomerFeatures } = useAuth()
  
  const { data: courses, isLoading: coursesLoading } = useSWR(
    "courses",
    getCourses
  )
  
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
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Real Estate Investing
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Expert-led video courses designed for real estate professionals. 
              Learn property valuation, market analysis, negotiation strategies, and more.
            </p>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Properties Analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Students Enrolled</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Hours of Content</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Available Courses
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose from our selection of professional real estate courses
            </p>
          </div>

          {coursesLoading ? (
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
