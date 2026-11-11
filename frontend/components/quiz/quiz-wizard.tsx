"use client"

import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import type { QuestionnaireQuestion, QuizPreview, ResultLean } from "@/lib/questionnaire-api"
import { ResultLeanBar } from "@/components/quiz/result-lean-bar"
import { suggestEmail } from "@/lib/email-suggest"
import {
  trackQuizSubmit,
  trackQuizSubmitError,
  useQuizFunnelTracking,
  type QuizName,
  type QuizStepInfo,
} from "@/lib/analytics"

/** Short pause after picking an answer so the selection is visible before advancing. */
const AUTO_ADVANCE_MS = 350

export type QuizAnswer = { questionId: string; optionIds: string[] }

export interface QuizContact {
  name: string
  email: string
  phone: string
}

/** Both quizzes' submit responses, normalized for display. */
export interface QuizResult {
  name: string
  result: string
  title: string
  summary: string
  roadmap: string
  lean?: ResultLean
  emailSent: boolean
  leadNotificationSent: boolean
}

export interface QuizWizardProps {
  quiz: QuizName
  title: string
  subtitle: string
  icon: ReactNode
  loadQuestions: () => Promise<QuestionnaireQuestion[]>
  previewAnswers: (answers: QuizAnswer[]) => Promise<QuizPreview>
  submit: (contact: QuizContact, answers: QuizAnswer[]) => Promise<QuizResult>
  /** e.g. "Your personalized path to a New Jersey real estate license." */
  resultDescription: string
  /** e.g. "your career profile and step-by-step roadmap" */
  resultsNoun: string
  cta: { label: string; href: string }
  footer: ReactNode
}

type WizardStep = { type: "question"; questionIndex: number } | { type: "contact" }

function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return "there"
  return trimmed.split(/\s+/)[0] ?? trimmed
}

export function QuizWizard({
  quiz,
  title,
  subtitle,
  icon,
  loadQuestions,
  previewAnswers,
  submit,
  resultDescription,
  resultsNoun,
  cta,
  footer,
}: QuizWizardProps) {
  const { data: questions, isLoading, error } = useSWR(`quiz-questions-${quiz}`, loadQuestions)

  const wizardSteps = useMemo<WizardStep[]>(
    () =>
      questions
        ? [
            ...questions.map((_, questionIndex) => ({ type: "question" as const, questionIndex })),
            { type: "contact" as const },
          ]
        : [],
    [questions]
  )

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emailBlurred, setEmailBlurred] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)

  const [preview, setPreview] = useState<QuizPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewKey = useRef<string | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = wizardSteps[stepIndex]
  const currentQuestion =
    currentStep?.type === "question" && questions ? questions[currentStep.questionIndex] : null
  const questionCount = questions?.length ?? 0

  const trackedStep = useMemo<QuizStepInfo | undefined>(() => {
    if (!currentStep) return undefined
    if (currentStep.type === "contact") return { type: "contact" }
    const q = questions?.[currentStep.questionIndex]
    return q
      ? { type: "question", questionId: q.id, questionNumber: currentStep.questionIndex + 1 }
      : undefined
  }, [currentStep, questions])

  useQuizFunnelTracking(quiz, trackedStep, stepIndex, wizardSteps.length)

  const answerList = useMemo<QuizAnswer[]>(
    () => (questions ?? []).map((q) => ({ questionId: q.id, optionIds: answers[q.id] ?? [] })),
    [questions, answers]
  )
  const allQuestionsAnswered =
    questionCount > 0 && answerList.every((a) => a.optionIds.length > 0)

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [])

  // Fetch the results teaser when the contact step opens (again only if answers changed).
  useEffect(() => {
    if (currentStep?.type !== "contact" || !allQuestionsAnswered) return
    const key = JSON.stringify(answerList)
    if (previewKey.current === key) return
    previewKey.current = key

    let cancelled = false
    setPreviewLoading(true)
    previewAnswers(answerList)
      .then((p) => {
        if (!cancelled) setPreview(p)
      })
      .catch(() => {
        // Teaser is optional — the form still works without it.
        if (!cancelled) setPreview(null)
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => {
      cancelled = true
      previewKey.current = null
    }
  }, [currentStep, allQuestionsAnswered, answerList, previewAnswers])

  const progressPercent =
    wizardSteps.length > 0 ? Math.round(((stepIndex + 1) / wizardSteps.length) * 100) : 0

  function goBack() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setStepIndex((i) => Math.max(0, i - 1))
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, wizardSteps.length - 1))
  }

  function selectSingle(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }))
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    const fromStep = stepIndex
    advanceTimer.current = setTimeout(() => {
      // Only advance if the person is still on the question they just answered.
      setStepIndex((i) => (i === fromStep ? Math.min(i + 1, wizardSteps.length - 1) : i))
    }, AUTO_ADVANCE_MS)
  }

  function toggleMultiple(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? []
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      return { ...prev, [questionId]: next }
    })
  }

  const emailSuggestion = useMemo(
    () => (emailBlurred ? suggestEmail(email) : null),
    [email, emailBlurred]
  )

  const canSubmit =
    allQuestionsAnswered && name.trim().length > 0 && email.trim().length > 0 && !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = await submit(
        { name: name.trim(), email: email.trim(), phone: phone.trim() },
        answerList
      )
      setResult(payload)
      trackQuizSubmit(quiz, payload.result)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      trackQuizSubmitError(quiz)
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
                Here are your results, {firstName(result.name)}.
              </CardTitle>
              <CardDescription>{resultDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{result.title}</p>
              </div>
              {result.lean && <ResultLeanBar lean={result.lean} />}
              <p className="text-center text-muted-foreground">{result.summary}</p>
              <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">{result.roadmap}</div>
              <p className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3 text-center text-sm">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {result.emailSent
                  ? `We just emailed a copy to ${email.trim()}, and our team will be in touch.`
                  : result.leadNotificationSent
                    ? "Our team received your results and will reach out at the email you provided."
                    : "Save this page for your records."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <a href={cta.href} target="_blank" rel="noopener noreferrer">
                    {cta.label}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 text-center text-xs text-muted-foreground">{footer}</div>
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
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {!isLoading && wizardSteps.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {currentStep?.type === "question"
                  ? `Question ${currentStep.questionIndex + 1} of ${questionCount}`
                  : "Last step — your results"}
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
        ) : !questionCount || !currentStep ? (
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
              {currentQuestion.allowMultiple ? (
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
                          onCheckedChange={() => toggleMultiple(currentQuestion.id, option.id)}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-relaxed">{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={answers[currentQuestion.id]?.[0] ?? ""}
                  onValueChange={(value) => selectSingle(currentQuestion.id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option.id}
                      htmlFor={`${currentQuestion.id}-${option.id}`}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`${currentQuestion.id}-${option.id}`}
                        className="mt-0.5"
                      />
                      <span className="text-sm leading-relaxed">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={goBack}>
                  ← Back
                </Button>
                <Button
                  type="button"
                  disabled={(answers[currentQuestion.id]?.length ?? 0) === 0}
                  onClick={goNext}
                >
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your results are ready!</CardTitle>
              <CardDescription>
                Tell us where to send {resultsNoun}. We&apos;ll email them to you right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewLoading ? (
                <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : preview ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your result
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">{preview.resultTitle}</p>
                  {preview.lean && <ResultLeanBar lean={preview.lean} className="mt-4" />}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {preview.teaser}
                  </p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-name">First name</Label>
                  <Input
                    id="quiz-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="given-name"
                    maxLength={100}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-email">Email</Label>
                  <Input
                    id="quiz-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailBlurred(false)
                    }}
                    onBlur={() => setEmailBlurred(true)}
                    required
                    placeholder="you@example.com"
                  />
                  {emailSuggestion && (
                    <p className="text-sm text-muted-foreground">
                      Did you mean{" "}
                      <button
                        type="button"
                        className="font-medium text-primary underline underline-offset-2"
                        onClick={() => setEmail(emailSuggestion)}
                      >
                        {emailSuggestion}
                      </button>
                      ?
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-phone">
                    Phone number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="quiz-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                    placeholder="(555) 555-5555"
                  />
                </div>
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                <div className="flex justify-between gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {submitting ? "Sending your results…" : "Email me my results"}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Your results are sent to this email as soon as you submit.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">{footer}</div>
      </div>
    </div>
  )
}
