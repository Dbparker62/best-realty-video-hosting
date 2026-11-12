import Link from "next/link"
import { FaqSection } from "@/components/faq-section"
import { HOME_FAQ } from "@/lib/faq"

export function HomeFaq() {
  return (
    <FaqSection
      title="New Jersey Real Estate License FAQ"
      items={HOME_FAQ}
      intro={
        <>
          Not sure where to start?{" "}
          <Link href="/questionnaire" className="font-medium text-primary underline-offset-4 hover:underline">
            Take the free 2-minute career quiz
          </Link>{" "}
          or read our{" "}
          <Link
            href="/how-to-get-a-real-estate-license-in-nj"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            step-by-step NJ license guide
          </Link>
          .
        </>
      }
    />
  )
}
