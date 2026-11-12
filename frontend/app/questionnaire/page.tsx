import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CareerQuiz } from "@/components/quiz/career-quiz"
import { DirectorSection } from "@/components/director-section"
import { FaqSection, faqJsonLd } from "@/components/faq-section"
import { JsonLd } from "@/components/json-ld"
import {
  CAREER_QUIZ_DISCLAIMER,
  CAREER_QUIZ_FAQ,
  CAREER_QUIZ_INTRO,
  CAREER_QUIZ_LEARN,
} from "@/lib/quiz-content"
import { LICENSE_STEPS } from "@/lib/school-facts"
import { SCHOOL_WEBSITE_URL } from "@/lib/site"

/**
 * Career quiz landing page (the Facebook / Instagram link).
 * The quiz sits at the top so visitors can start right away; the explanatory
 * content below is server-rendered so search engines can read it.
 */
export default function QuestionnairePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(CAREER_QUIZ_FAQ)} />

      <section id="quiz" className="scroll-mt-16">
        <CareerQuiz />
      </section>

      {/* Why take the quiz */}
      <section className="border-t bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Thinking About a Career in New Jersey Real Estate?
          </h2>
          {CAREER_QUIZ_INTRO.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <h3 className="mt-8 text-lg font-semibold text-foreground">
            Answer four quick questions to find out:
          </h3>
          <ul className="mt-4 space-y-3">
            {CAREER_QUIZ_LEARN.map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-3">
            <Button asChild size="lg">
              <a href="#quiz">
                Take the Free Career Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">{CAREER_QUIZ_DISCLAIMER}</p>
          </div>
        </div>
      </section>

      <DirectorSection />

      {/* Licensing steps */}
      <section className="border-t bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How to Get Your Real Estate License in New Jersey
          </h2>
          <ol className="mt-8 space-y-6">
            {LICENSE_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FaqSection title="Frequently Asked Questions" items={CAREER_QUIZ_FAQ} className="bg-background" />

      {/* Closing call to action */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to Explore a New Career?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Take the free quiz, review your results, and see how Best School of Real Estate can help
            you start your licensing journey.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#quiz">
                Start My Free Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={SCHOOL_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                Explore Real Estate Classes
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
