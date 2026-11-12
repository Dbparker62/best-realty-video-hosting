"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import {
  QuizWizard,
  type QuizAnswer,
  type QuizContact,
  type QuizResult,
} from "@/components/quiz/quiz-wizard"
import {
  getLeadershipQuestions,
  previewLeadershipQuestionnaire,
  submitLeadershipQuestionnaire,
} from "@/lib/leadership-questionnaire-api"
import { SCHOOL_WEBSITE_URL, SITE_NAME } from "@/lib/site"

async function submitLeadershipQuiz(
  contact: QuizContact,
  answers: QuizAnswer[]
): Promise<QuizResult> {
  const r = await submitLeadershipQuestionnaire({ ...contact, answers })
  return {
    name: r.name,
    result: r.outcome,
    title: r.outcomeTitle,
    summary: r.outcomeSummary,
    roadmap: r.roadmap,
    lean: r.lean,
    emailSent: r.emailSent,
    leadNotificationSent: r.leadNotificationSent,
  }
}

/** The interactive Team-or-Broker quiz (client side). The page around it is server-rendered. */
export function LeadershipQuiz() {
  return (
    <QuizWizard
      quiz="leadership"
      eyebrow="Free 2-Minute Quiz · No obligation"
      title="Should You Build a Team or Become a Broker?"
      subtitle="Take our free 2-minute quiz to see whether building a team or becoming a broker of record fits your goals."
      icon={<Users className="h-5 w-5" />}
      loadQuestions={getLeadershipQuestions}
      previewAnswers={previewLeadershipQuestionnaire}
      submit={submitLeadershipQuiz}
      resultDescription="Your recommended leadership path in New Jersey real estate."
      resultsNoun="your leadership profile and next-step roadmap"
      cta={{ label: `Visit ${SITE_NAME}`, href: SCHOOL_WEBSITE_URL }}
      footer={
        <Link href="/questionnaire" className="underline hover:text-foreground">
          Looking to get your NJ license instead?
        </Link>
      }
    />
  )
}
