"use client"

import { ClipboardList } from "lucide-react"
import {
  QuizWizard,
  type QuizAnswer,
  type QuizContact,
  type QuizResult,
} from "@/components/quiz/quiz-wizard"
import {
  getQuestionnaireQuestions,
  previewQuestionnaire,
  submitQuestionnaire,
} from "@/lib/questionnaire-api"
import { ONLINE_COURSES_URL, SITE_NAME } from "@/lib/site"

async function submitCareerQuiz(contact: QuizContact, answers: QuizAnswer[]): Promise<QuizResult> {
  const r = await submitQuestionnaire({ ...contact, answers })
  return {
    name: r.name,
    result: r.careerPath,
    title: r.careerPathTitle,
    summary: r.readinessLabel,
    roadmap: r.roadmap,
    lean: r.lean,
    emailSent: r.emailSent,
    leadNotificationSent: r.leadNotificationSent,
  }
}

/** The interactive career quiz (client side). The page around it is server-rendered. */
export function CareerQuiz() {
  return (
    <QuizWizard
      quiz="career"
      eyebrow="Free 2-Minute Quiz · No obligation"
      title="Could a Real Estate Career Be Right for You?"
      subtitle="Take our free 2-minute quiz to see if real estate is right for you, and get your New Jersey licensing roadmap."
      icon={<ClipboardList className="h-5 w-5" />}
      loadQuestions={getQuestionnaireQuestions}
      previewAnswers={previewQuestionnaire}
      submit={submitCareerQuiz}
      resultDescription="Your personalized path to a New Jersey real estate license."
      resultsNoun="your career profile and step-by-step roadmap"
      cta={{ label: "Enroll in Our Online Course", href: ONLINE_COURSES_URL }}
      footer={`${SITE_NAME} · New Jersey real estate pre-licensing education`}
    />
  )
}
