import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DirectorSection } from "@/components/director-section"
import { FaqSection, faqJsonLd } from "@/components/faq-section"
import { JsonLd } from "@/components/json-ld"
import { QuizCtaBand } from "@/components/quiz-cta-band"
import {
  GUIDE_DESCRIPTION,
  GUIDE_EXTRA,
  GUIDE_FAQ,
  GUIDE_INTRO,
  GUIDE_PATH,
  GUIDE_STEPS,
  GUIDE_TITLE,
  GUIDE_UPDATED,
  NJREC_CE_URL,
  NJREC_URL,
  QUICK_FACTS,
  type GuideSection,
} from "@/lib/guide-content"
import { DIRECTOR } from "@/lib/school-facts"
import { ONLINE_COURSES_URL, SCHOOL_WEBSITE_URL, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "How to Get a Real Estate License in NJ: Step-by-Step Guide",
  description: GUIDE_DESCRIPTION,
  path: GUIDE_PATH,
})

const updatedLabel = new Date(`${GUIDE_UPDATED}T12:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function Section({ section, index }: { section: GuideSection; index?: number }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <h2 className="flex items-start gap-3 text-2xl font-extrabold tracking-tight text-foreground">
        {index != null && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
            {index}
          </span>
        )}
        <span>{index != null ? section.heading.replace(/^Step \d+: /, "") : section.heading}</span>
      </h2>
      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      {section.bullets && (
        <ul className="mt-4 space-y-2">
          {section.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {section.after?.map((p) => (
        <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
    </section>
  )
}

function QuizCallout() {
  return (
    <aside className="rounded-2xl border border-brand/20 bg-accent p-6">
      <p className="text-sm font-bold uppercase tracking-wider text-brand">Free 2-minute quiz</p>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Not sure if real estate is right for you? Find out which path fits your goals and schedule.
      </p>
      <Button asChild className="mt-4">
        <Link href="/questionnaire">
          Take the Career Quiz
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </aside>
  )
}

export default function LicenseGuidePage() {
  const url = `${SITE_URL}${GUIDE_PATH}`
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: GUIDE_TITLE,
              description: GUIDE_DESCRIPTION,
              url,
              mainEntityOfPage: url,
              dateModified: GUIDE_UPDATED,
              author: { "@type": "Person", name: DIRECTOR.name, jobTitle: DIRECTOR.title },
              publisher: { "@id": `${SITE_URL}/#organization` },
              image: `${url}/opengraph-image`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "NJ License Guide", item: url },
              ],
            },
          ],
        }}
      />
      <JsonLd data={faqJsonLd(GUIDE_FAQ)} />

      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">NJ License Guide</span>
          </nav>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
            Step-by-step guide
          </p>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {GUIDE_TITLE}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{GUIDE_INTRO}</p>
          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>
              By <span className="font-semibold text-foreground">{DIRECTOR.name}</span>, {DIRECTOR.title},{" "}
              {SITE_NAME}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Updated <time dateTime={GUIDE_UPDATED}>{updatedLabel}</time>
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick facts */}
        <section aria-labelledby="quick-facts" className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 id="quick-facts" className="text-lg font-bold uppercase tracking-wide text-brand">
            NJ salesperson license at a glance
          </h2>
          <dl className="mt-4 divide-y">
            {QUICK_FACTS.map((f) => (
              <div key={f.label} className="grid grid-cols-[9rem_1fr] gap-4 py-2.5 text-sm sm:grid-cols-[12rem_1fr]">
                <dt className="font-semibold text-foreground">{f.label}</dt>
                <dd className="text-muted-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Table of contents */}
        <nav aria-label="On this page" className="rounded-2xl border bg-white p-6">
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">On this page</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {[...GUIDE_STEPS, ...GUIDE_EXTRA].map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq" className="text-primary hover:underline">
                Frequently asked questions
              </a>
            </li>
          </ol>
        </nav>

        {GUIDE_STEPS.map((s, i) => (
          <div key={s.id} className="space-y-12">
            <Section section={s} index={i + 1} />
            {s.id === "course" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline">
                  <a href={SCHOOL_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                    See the current class schedule
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <a href={ONLINE_COURSES_URL} target="_blank" rel="noopener noreferrer">
                    Browse our online courses
                  </a>
                </Button>
              </div>
            )}
            {s.id === "exam" && <QuizCallout />}
          </div>
        ))}

        {GUIDE_EXTRA.map((s) => (
          <Section key={s.id} section={s} />
        ))}

        <p className="text-sm text-muted-foreground">
          Requirements can change. For official rules, fees, and continuing education requirements, see the{" "}
          <a href={NJREC_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            New Jersey Real Estate Commission
          </a>{" "}
          and its{" "}
          <a href={NJREC_CE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            continuing education page
          </a>
          . Thinking about leading a team or opening your own office? Take our{" "}
          <Link href="/questionnaire/leadership" className="text-primary hover:underline">
            Team or Broker quiz
          </Link>
          .
        </p>
      </div>

      <DirectorSection />
      <QuizCtaBand />
      <div id="faq" className="scroll-mt-24">
        <FaqSection title="Frequently Asked Questions" items={GUIDE_FAQ} className="bg-background" />
      </div>
    </>
  )
}
