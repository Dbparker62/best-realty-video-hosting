import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { fetchPublicCourse } from "@/lib/server-courses"
import { NO_INDEX, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site"

type Params = Promise<{ courseId: string }>

function summarize(text: string, fallback: string): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return fallback
  return clean.length <= 160 ? clean : `${clean.slice(0, 157).replace(/\s+\S*$/, "")}…`
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { courseId } = await params
  const course = await fetchPublicCourse(courseId)
  if (!course) return { title: "Course Not Found", ...NO_INDEX }
  return pageMetadata({
    title: course.title,
    description: summarize(
      course.description,
      `${course.title} — a New Jersey real estate course from ${SITE_NAME}.`
    ),
    path: `/courses/${encodeURIComponent(course.id)}`,
  })
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const { courseId } = await params
  const course = await fetchPublicCourse(courseId)

  return (
    <>
      {course && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: summarize(course.description, course.title),
            url: `${SITE_URL}/courses/${encodeURIComponent(course.id)}`,
            provider: {
              "@type": "EducationalOrganization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
            },
            ...(course.published && course.price > 0
              ? {
                  offers: {
                    "@type": "Offer",
                    category: "Paid",
                    price: course.price.toFixed(2),
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
          }}
        />
      )}
      {children}
    </>
  )
}
