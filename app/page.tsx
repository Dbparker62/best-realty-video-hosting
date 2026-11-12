import { CourseCatalog } from "@/components/course-catalog"
import { HomeFaq } from "@/components/home-faq"
import { DirectorSection } from "@/components/director-section"
import { JsonLd } from "@/components/json-ld"
import { HOME_FAQ } from "@/lib/faq"
import { fetchPublicCourses } from "@/lib/server-courses"
import { SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: { absolute: `New Jersey Real Estate License Courses | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  path: "/",
})

export default async function HomePage() {
  // Rendered on the server so the course list and links are in the HTML.
  // If the API is down, the client loads the list as before.
  const courses = await fetchPublicCourses()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <CourseCatalog initialCourses={courses ?? undefined} />
      <DirectorSection />
      <HomeFaq />
    </>
  )
}
