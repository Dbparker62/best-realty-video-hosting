"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback } from "react"
import useSWR from "swr"
import { getCourses, initiateCheckout, getMyCourses } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { CourseCard } from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Clock, MonitorPlay, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Course } from "@/lib/types"
import { PROOF_POINTS } from "@/lib/school-facts"
import { CONTACT, SCHOOL_WEBSITE_URL } from "@/lib/site"

const FORMATS = [
  { icon: MonitorPlay, title: "Live on Zoom", body: "Instructor-led evening classes you can join from home." },
  { icon: Clock, title: "Self-Paced Online", body: "Study anytime, anywhere, 24/7, at your own pace." },
  { icon: Users, title: "In Person", body: "Classroom instruction with our licensed instructors." },
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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Faint logo watermark */}
        <Image
          src="/logo-mark.png"
          alt=""
          aria-hidden
          width={436}
          height={289}
          className="pointer-events-none absolute -bottom-10 -right-16 hidden w-[34rem] opacity-[0.04] lg:block"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
              Licensed by the NJ Real Estate Commission
            </p>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Master the <span className="text-brand">New Jersey</span> Real Estate Exam
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Expert-led video courses designed for New Jersey real estate pre-licensing.
              Learn property valuation, market analysis, negotiation strategies, and more.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base shadow-md shadow-primary/25">
                <Link href="/questionnaire">
                  Take the Free 2-Minute Quiz
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <a href="#courses">Browse Courses</a>
              </Button>
            </div>
            <a
              href={CONTACT.phoneHref}
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-4 w-4 text-primary" />
              Questions? Call us at <span className="font-semibold text-foreground">{CONTACT.phone}</span>
            </a>
          </div>

          {/* Class formats */}
          <div className="rounded-2xl border bg-card p-6 shadow-lg shadow-brand/5 sm:p-8">
            <h2 className="text-lg font-bold uppercase tracking-wide text-brand">Get licensed your way</h2>
            <ul className="mt-6 space-y-5">
              {FORMATS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href={SCHOOL_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              See the current class schedule
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Proof bar */}
      <section className="bg-brand text-brand-foreground">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {PROOF_POINTS.map((p) => (
            <div key={p.label} className="text-center">
              <dt className="sr-only">{p.label}</dt>
              <dd className="font-[family-name:var(--font-heading)] text-2xl font-extrabold sm:text-3xl">{p.value}</dd>
              <dd className="mt-1 text-xs uppercase tracking-wider text-brand-foreground/80 sm:text-sm">{p.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Course Grid */}
      <section id="courses" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">Courses</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
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
