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

const SCHOOL_WEBSITE_URL =
  process.env.NEXT_PUBLIC_SCHOOL_WEBSITE_URL ?? "http://bestschoolofrealestate.biz"

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

export default function LeadershipQuestionnairePage() {
  return (
    <QuizWizard
      quiz="leadership"
      title="Team or Broker of Record?"
      subtitle="5 quick questions — discover whether to build a team or lead a brokerage."
      icon={<Users className="h-5 w-5" />}
      loadQuestions={getLeadershipQuestions}
      previewAnswers={previewLeadershipQuestionnaire}
      submit={submitLeadershipQuiz}
      resultDescription="Your recommended leadership path in New Jersey real estate."
      resultsNoun="your leadership profile and next-step roadmap"
      cta={{ label: "Visit Best School Of Real Estate", href: SCHOOL_WEBSITE_URL }}
      footer={
        <Link href="/questionnaire" className="underline hover:text-foreground">
          Looking to get your NJ license instead?
        </Link>
      }
    />
  )
}
