"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getQuestionnaireQuestions,
  submitQuestionnaire,
  type QuestionnaireQuestion,
  type QuestionnaireSubmitResult,
} from "@/lib/questionnaire-api"

const SCHOOL_WEBSITE_URL =
  process.env.NEXT_PUBLIC_SCHOOL_WEBSITE_URL ?? "http://bestschoolofrealestate.biz"

type WizardStep =
  | { type: "question"; questionIndex: number }
  | { type: "name" }
  | { type: "email" }

function buildWizardSteps(questions: QuestionnaireQuestion[]): WizardStep[] {
  const steps: WizardStep[] = []
  questions.forEach((_, index) => {
    steps.push({ type: "question", questionIndex: index })
    if (index === 0) steps.push({ type: "name" })
  })
  steps.push({ type: "email" })
  return steps
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return "there"
  return trimmed.split(/\s+/)[0] ?? trimmed
}

export default function QuestionnairePage() {
  const { data: questions, isLoading, error } = useSWR(
    "questionnaire-questions",
    getQuestionnaireQuestions
  )

  const wizardSteps = useMemo(
    () => (questions ? buildWizardSteps(questions) : []),
    [questions]
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<QuestionnaireSubmitResult | null>(null)

  const currentStep = wizardSteps[stepIndex]
  const currentQuestion =
    currentStep?.type === "question" && questions
      ? questions[currentStep.questionIndex]
      : null

  const progressPercent =
    wizardSteps.length > 0
      ? Math.round(((stepIndex + 1) / wizardSteps.length) * 100)
      : 0

  const allQuestionsAnswered = useMemo(() => {
    if (!questions?.length) return false
    return questions.every((q) => (answers[q.id]?.length ?? 0) > 0)
  }, [questions, answers])

  function toggleOption(questionId: string, optionId: string, allowMultiple: boolean) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? []
      if (!allowMultiple) {
        return { ...prev, [questionId]: [optionId] }
      }
      if (current.includes(optionId)) {
        const next = current.filter((id) => id !== optionId)
        return { ...prev, [questionId]: next }
      }
      return { ...prev, [questionId]: [...current, optionId] }
    })
  }

  function canContinue(): boolean {
    if (!currentStep) return false
    if (currentStep.type === "question" && currentQuestion) {
      return (answers[currentQuestion.id]?.length ?? 0) > 0
    }
    if (currentStep.type === "name") return name.trim().length > 0
    if (currentStep.type === "email") {
      return allQuestionsAnswered && name.trim().length > 0 && email.trim().length > 0
    }
    return false
  }

  function handleNext() {
    if (!canContinue()) return
    setStepIndex((i) => Math.min(i + 1, wizardSteps.length - 1))
  }

  async function handleFinalSubmit(e: FormEvent) {
    e.preventDefault()
    if (!questions?.length) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = await submitQuestionnaire({
        name: name.trim(),
        email: email.trim(),
        answers: questions.map((q) => ({
          questionId: q.id,
          optionIds: answers[q.id] ?? [],
        })),
      })
      setResult(payload)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">
                Your results are ready, {firstName(result.name)}.
              </CardTitle>
              <CardDescription>
                Your personalized path to a New Jersey real estate license.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{result.careerPathTitle}</p>
                <p className="mt-4 text-muted-foreground">{result.readinessLabel}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
                {result.roadmap}
              </div>
              {result.emailSent ? (
                <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm">
                  We emailed your career profile and roadmap to you. Check your inbox.
                </p>
              ) : result.leadNotificationSent ? (
                <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm">
                  Our team received your results and will reach out at the email you provided.
                </p>
              ) : (
                <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                  Your roadmap is shown above — save it for your records.
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <a
                    href={SCHOOL_WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View NJ Pre-Licensing Courses
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Best School Of Real Estate · New Jersey real estate pre-licensing education
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NJ Real Estate Career Quiz</h1>
              <p className="text-sm text-muted-foreground">
                Best School Of Real Estate — find your path to a New Jersey license.
              </p>
            </div>
          </div>
          {!isLoading && wizardSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Step {Math.min(stepIndex + 1, wizardSteps.length)} of {wizardSteps.length}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-destructive">
              Could not load questions. Please try again later.
            </CardContent>
          </Card>
        ) : !questions?.length || !currentStep ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No questions available yet.
            </CardContent>
          </Card>
        ) : currentStep.type === "question" && currentQuestion ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-snug">{currentQuestion.prompt}</CardTitle>
              {currentQuestion.subtitle && (
                <CardDescription>{currentQuestion.subtitle}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const selected = (answers[currentQuestion.id] ?? []).includes(option.id)
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                        selected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                          toggleOption(
                            currentQuestion.id,
                            option.id,
                            currentQuestion.allowMultiple
                          )
                        }
                        className="mt-0.5"
                      />
                      <span className="text-sm leading-relaxed">{option.label}</span>
                    </label>
                  )
                })}
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                >
                  ← Back
                </Button>
                <Button type="button" disabled={!canContinue()} onClick={handleNext}>
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentStep.type === "name" ? (
          <Card>
            <CardHeader>
              <CardTitle>What is your name?</CardTitle>
              <CardDescription>We&apos;ll personalize your career roadmap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  maxLength={100}
                  autoFocus
                />
              </div>
              {name.trim() && (
                <p className="text-sm text-muted-foreground">
                  Thanks, {firstName(name)}! A few more.
                </p>
              )}
              <div className="flex justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                >
                  ← Back
                </Button>
                <Button type="button" disabled={!canContinue()} onClick={handleNext}>
                  Continue →
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                Your results are ready, {firstName(name)}.
              </CardTitle>
              <CardDescription>
                Tell us where to send your career profile and step-by-step roadmap to a New
                Jersey license.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}
                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  >
                    ← Back
                  </Button>
                  <Button type="submit" disabled={submitting || !canContinue()}>
                    {submitting ? "Building your profile…" : "Get my roadmap"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Best School Of Real Estate · New Jersey real estate pre-licensing education
        </p>
      </div>
    </div>
  )
}
