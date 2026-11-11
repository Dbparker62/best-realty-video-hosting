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

const SCHOOL_WEBSITE_URL =
  process.env.NEXT_PUBLIC_SCHOOL_WEBSITE_URL ?? "http://bestschoolofrealestate.biz"

async function submitCareerQuiz(contact: QuizContact, answers: QuizAnswer[]): Promise<QuizResult> {
  const r = await submitQuestionnaire({ ...contact, answers })
  return {
    name: r.name,
    result: r.careerPath,
    title: r.careerPathTitle,
    summary: r.readinessLabel,
    roadmap: r.roadmap,
    emailSent: r.emailSent,
    leadNotificationSent: r.leadNotificationSent,
  }
}

export default function QuestionnairePage() {
  return (
    <QuizWizard
      quiz="career"
      title="NJ Real Estate Career Quiz"
      subtitle="4 quick questions — find your path to a New Jersey license."
      icon={<ClipboardList className="h-5 w-5" />}
      loadQuestions={getQuestionnaireQuestions}
      previewAnswers={previewQuestionnaire}
      submit={submitCareerQuiz}
      resultDescription="Your personalized path to a New Jersey real estate license."
      resultsNoun="your career profile and step-by-step roadmap"
      cta={{ label: "View NJ Pre-Licensing Courses", href: SCHOOL_WEBSITE_URL }}
      footer="Best School Of Real Estate · New Jersey real estate pre-licensing education"
    />
  )
}
