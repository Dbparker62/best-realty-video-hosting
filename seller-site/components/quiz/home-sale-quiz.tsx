"use client"

import { Home } from "lucide-react"
import Link from "next/link"
import {
  QuizWizard,
  type QuizAnswer,
  type QuizContact,
  type QuizResult,
} from "@/components/quiz/quiz-wizard"
import {
  getHomeSaleQuestions,
  previewHomeSaleQuestionnaire,
  submitHomeSaleQuestionnaire,
} from "@/lib/home-sale-questionnaire-api"
import { CONTACT } from "@/lib/site"

async function submitHomeSaleQuiz(contact: QuizContact, answers: QuizAnswer[]): Promise<QuizResult> {
  const r = await submitHomeSaleQuestionnaire({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    county: contact.county ?? "",
    town: contact.town ?? "",
    answers,
  })
  const top = r.priorities.slice(0, 3)
  const more = r.priorities.length - top.length
  const highlights = [
    {
      label: "Top priorities",
      value: top.length
        ? top.map((p, i) => `${i + 1}. ${p}`).join("\n") + (more > 0 ? `\n(+${more} more)` : "")
        : "Nothing major. You're in great shape.",
    },
  ]
  if (r.negotiationPlan.length) highlights.push({ label: "Negotiation plan", value: r.negotiationPlan.join("\n") })
  if (r.listingTiming) highlights.push({ label: "Listing timing", value: r.listingTiming })

  return {
    name: r.name,
    result: r.readinessLabel,
    title: r.title,
    summary: r.summary,
    roadmap: r.roadmap,
    lean: r.lean,
    highlights,
    emailSent: r.emailSent,
    leadNotificationSent: r.leadNotificationSent,
  }
}

/** The interactive Home Sale Readiness quiz (client side). The page around it is server-rendered. */
export function HomeSaleQuiz() {
  return (
    <QuizWizard
      quiz="home_sale"
      eyebrow="Free 3-Minute Quiz · No obligation"
      title="How Ready Is Your Home to Sell?"
      subtitle="Answer 15 quick questions to get your readiness score, your top priorities, and a plan for your sale."
      icon={<Home className="h-5 w-5" />}
      loadQuestions={getHomeSaleQuestions}
      previewAnswers={previewHomeSaleQuestionnaire}
      submit={submitHomeSaleQuiz}
      askLocation
      resultDescription="Your home sale readiness report."
      resultsNoun="your readiness report and top priorities"
      cta={{ label: `Talk to Us: ${CONTACT.phone}`, href: CONTACT.phoneHref }}
      footer={
        <Link href="/privacy" className="underline hover:text-foreground">
          How we use your information
        </Link>
      }
    />
  )
}
