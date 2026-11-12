import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadershipQuiz } from "@/components/quiz/leadership-quiz"
import { DirectorSection } from "@/components/director-section"
import { FaqSection, faqJsonLd } from "@/components/faq-section"
import { JsonLd } from "@/components/json-ld"
import {
  BROKER_REQUIREMENTS,
  LEADERSHIP_COMPARISON,
  LEADERSHIP_FAQ,
  LEADERSHIP_INTRO,
  LEADERSHIP_LEARN,
} from "@/lib/leadership-content"
import { CAREER_QUIZ_DISCLAIMER } from "@/lib/quiz-content"
import { BROKER_COURSES_URL } from "@/lib/site"

/** Team-or-Broker quiz landing page: quiz first, server-rendered content below. */
export default function LeadershipQuestionnairePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(LEADERSHIP_FAQ)} />

      <section id="quiz" className="scroll-mt-20">
        <LeadershipQuiz />
      </section>

      {/* Why take the quiz */}
      <section className="border-t bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Ready to Grow Beyond Your Own Sales?
          </h2>
          {LEADERSHIP_INTRO.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <h3 className="mt-8 text-lg font-semibold text-foreground">The quiz helps you find out:</h3>
          <ul className="mt-4 space-y-3">
            {LEADERSHIP_LEARN.map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-3">
            <Button asChild size="lg">
              <a href="#quiz">
                Take the Free Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">{CAREER_QUIZ_DISCLAIMER}</p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Team Leader vs. Broker of Record
          </h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="bg-brand text-brand-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">Build a Team</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Broker of Record</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {LEADERSHIP_COMPARISON.map((row) => (
                  <tr key={row.label} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{row.team}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.broker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Broker requirements */}
      <section className="border-t bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            New Jersey Broker License Requirements
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            To become a broker or broker-salesperson in New Jersey, you must:
          </p>
          <ol className="mt-6 space-y-4">
            {BROKER_REQUIREMENTS.map((req, i) => (
              <li key={req.slice(0, 24)} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                  {i + 1}
                </span>
                <p className="leading-relaxed text-muted-foreground">{req}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Best School of Real Estate offers the full 150-hour broker package 100% online and self-paced.{" "}
            <a href={BROKER_COURSES_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              See our online broker courses
            </a>
            .
          </p>
        </div>
      </section>

      <DirectorSection />

      <FaqSection title="Frequently Asked Questions" items={LEADERSHIP_FAQ} className="bg-background" />

      {/* Closing call to action */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Find Your Leadership Path
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Take the free quiz and get a personalized roadmap for building a team or becoming a broker of
            record. Not licensed yet?{" "}
            <Link href="/how-to-get-a-real-estate-license-in-nj" className="text-primary hover:underline">
              Start with our NJ license guide
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#quiz">
                Start My Free Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={BROKER_COURSES_URL} target="_blank" rel="noopener noreferrer">
                Explore Broker Courses
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
