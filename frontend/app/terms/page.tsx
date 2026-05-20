import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | Best Realty Courses",
  description:
    "Read the terms and conditions for using Best Realty Courses platform.",
}

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-4 text-muted-foreground">
              By accessing or using Best Realty Courses, you agree to be bound
              by these Terms of Service. If you do not agree to these terms,
              please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              2. Use of Services
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our platform provides online real estate education courses. You
              agree to use our services only for lawful purposes and in
              accordance with these terms.
            </p>
            <p className="mt-4 text-muted-foreground">You agree not to:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                Share your account credentials with others
              </li>
              <li>
                Copy, distribute, or share course content without authorization
              </li>
              <li>
                Use automated systems to access or interact with our platform
              </li>
              <li>
                Attempt to interfere with or disrupt our services
              </li>
              <li>
                Use our services for any illegal or unauthorized purpose
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              3. Account Registration
            </h2>
            <p className="mt-4 text-muted-foreground">
              To access certain features, you must create an account. You are
              responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              4. Course Access and Licenses
            </h2>
            <p className="mt-4 text-muted-foreground">
              Upon purchasing a course, you are granted a limited,
              non-exclusive, non-transferable license to access and view the
              course content for your personal, non-commercial educational
              purposes.
            </p>
            <p className="mt-4 text-muted-foreground">
              Course access is typically granted for a lifetime from the date of
              purchase, unless otherwise specified.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              5. Intellectual Property
            </h2>
            <p className="mt-4 text-muted-foreground">
              All content on our platform, including videos, text, graphics, and
              logos, is the property of Best Realty Courses or its content
              suppliers and is protected by copyright and intellectual property
              laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              6. Payment Terms
            </h2>
            <p className="mt-4 text-muted-foreground">
              All prices are listed in USD unless otherwise specified. We
              reserve the right to modify prices at any time. Purchased courses
              are subject to our{" "}
              <Link
                href="/refund"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              7. Disclaimer of Warranties
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our services are provided &quot;as is&quot; without warranties of
              any kind. We do not guarantee that our courses will result in
              passing any licensing exam or achieving specific outcomes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="mt-4 text-muted-foreground">
              To the maximum extent permitted by law, Best Realty Courses shall
              not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              9. Modifications to Terms
            </h2>
            <p className="mt-4 text-muted-foreground">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes by posting a notice on our
              website. Continued use of our services after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              10. Contact Information
            </h2>
            <p className="mt-4 text-muted-foreground">
              For questions about these Terms of Service, please visit our{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
