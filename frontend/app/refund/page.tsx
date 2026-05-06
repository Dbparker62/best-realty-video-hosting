import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Refund Policy | Best Realty Courses",
  description:
    "Learn about our refund policy for course purchases at Best Realty Courses.",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Our Satisfaction Guarantee
            </h2>
            <p className="mt-4 text-muted-foreground">
              We want you to be completely satisfied with your purchase. If
              you&apos;re not happy with a course, we offer a straightforward
              refund policy to ensure your peace of mind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              30-Day Money-Back Guarantee
            </h2>
            <p className="mt-4 text-muted-foreground">
              We offer a 30-day money-back guarantee on all course purchases. If
              you are not satisfied with a course for any reason, you may
              request a full refund within 30 days of your purchase date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Eligibility for Refunds
            </h2>
            <p className="mt-4 text-muted-foreground">
              To be eligible for a refund:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                Your request must be made within 30 days of the original
                purchase
              </li>
              <li>
                You have not completed more than 30% of the course content
              </li>
              <li>
                You have not previously received a refund for the same course
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              How to Request a Refund
            </h2>
            <p className="mt-4 text-muted-foreground">
              To request a refund, please follow these steps:
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                Visit our{" "}
                <Link
                  href="/contact"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Contact page
                </Link>
              </li>
              <li>
                Include your order number and the email address used for the
                purchase
              </li>
              <li>Briefly explain the reason for your refund request</li>
              <li>
                Our team will review your request and respond within 3-5
                business days
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Refund Processing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Once your refund is approved:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                Refunds will be processed to the original payment method
              </li>
              <li>
                Processing time is typically 5-10 business days depending on
                your payment provider
              </li>
              <li>
                You will receive an email confirmation once the refund has been
                processed
              </li>
              <li>
                Course access will be revoked upon refund approval
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Non-Refundable Items
            </h2>
            <p className="mt-4 text-muted-foreground">
              The following are not eligible for refunds:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Courses purchased more than 30 days ago</li>
              <li>
                Courses where more than 30% of the content has been completed
              </li>
              <li>Bundle purchases (individual courses may be refunded)</li>
              <li>Promotional or discounted courses (case-by-case basis)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Questions?
            </h2>
            <p className="mt-4 text-muted-foreground">
              If you have any questions about our refund policy, please don&apos;t
              hesitate to{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                contact our support team
              </Link>
              . We&apos;re here to help!
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
