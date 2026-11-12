import { ArrowRight, CheckCircle2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomeSaleQuiz } from "@/components/quiz/home-sale-quiz"
import { DirectorSection } from "@/components/director-section"
import { FaqSection, faqJsonLd } from "@/components/faq-section"
import { JsonLd } from "@/components/json-ld"
import { HOME_SALE_FAQ, HOME_SALE_INTRO, HOME_SALE_LEARN, NJ_RESALE_BASICS } from "@/lib/home-sale-content"
import { CONTACT } from "@/lib/site"

/** Home Sale Readiness quiz landing page: quiz first, server-rendered content below. */
export default function HomeSaleQuestionnairePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(HOME_SALE_FAQ)} />

      <section id="quiz" className="scroll-mt-20">
        <HomeSaleQuiz />
      </section>

      {/* Why take the quiz */}
      <section className="border-t bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Selling in New Jersey? Know What to Fix First.
          </h2>
          {HOME_SALE_INTRO.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <h3 className="mt-8 text-lg font-semibold text-foreground">Your free report includes:</h3>
          <ul className="mt-4 space-y-3">
            {HOME_SALE_LEARN.map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8">
            <a href="#quiz">
              Get My Readiness Score
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* NJ resale basics */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            New Jersey Resale Basics
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {NJ_RESALE_BASICS.map((b) => (
              <div key={b.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="font-bold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            General information, not legal advice. Requirements vary by town; confirm with your municipality.
          </p>
        </div>
      </section>

      <DirectorSection heading="Sell With an Experienced New Jersey Broker" />

      <FaqSection title="Frequently Asked Questions" items={HOME_SALE_FAQ} className="bg-background" />

      {/* Closing call to action */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Ready to Talk About Selling?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Take the quiz for your free readiness report, or call us to talk through your timeline and price.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#quiz">
                Start the Free Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={CONTACT.phoneHref}>
                <Phone className="h-4 w-4" />
                Call {CONTACT.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
