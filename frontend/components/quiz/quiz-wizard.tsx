"use client"

import type { FormEvent, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Mail } from "lucide-react"
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
import { SERVICE_AREA, SERVICE_COUNTIES } from "@/lib/nj"
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
  /** Only collected when `askLocation` is on. */
  county?: string
  town?: string
}

/** Both quizzes' submit responses, normalized for display. */
export interface QuizResult {
  name: string
  result: string
  title: string
  summary: string
  roadmap: string
  lean?: ResultLean
  /** Extra label/value rows shown under the roadmap (e.g. town requirements). */
  highlights?: { label: string; value: string }[]
  emailSent: boolean
  leadNotificationSent: boolean
}

export interface QuizWizardProps {
  quiz: QuizName
  /** Small label above the heading, e.g. "Free 2-Minute Quiz · No obligation". */
  eyebrow?: string
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
  /** Ask for NJ county + town on the final step (home sale quiz). */
  askLocation?: boolean
}

type WizardStep = { type: "question"; questionIndex: number } | { type: "contact" }

function firstName(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return "there"
  return trimmed.split(/\s+/)[0] ?? trimmed
}

export function QuizWizard({
  quiz,
  eyebrow,
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
  askLocation = false,
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
  const [county, setCounty] = useState("")
  const [town, setTown] = useState("")
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
    allQuestionsAnswered &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    (!askLocation || (county.length > 0 && town.trim().length > 0)) &&
    !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = await submit(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          ...(askLocation ? { county, town: town.trim() } : {}),
        },
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
      <div className="bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Card className="overflow-hidden rounded-2xl border-primary/15 py-0 shadow-xl shadow-primary/10">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand/85 px-6 py-10 text-center text-brand-foreground">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
              />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/10">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">
                  Here are your results, {firstName(result.name)}.
                </h2>
                <p className="mt-1 text-sm text-brand-foreground/80">{resultDescription}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand-foreground/70">
                  Your result
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{result.title}</p>
              </div>
            </div>
            <CardContent className="space-y-6 px-6 py-8 sm:px-8">
              {result.lean && <ResultLeanBar lean={result.lean} />}
              <p className="text-center text-lg font-medium text-foreground">{result.summary}</p>
              <div className="rounded-xl border-l-4 border-primary bg-muted/60 p-5 text-sm leading-relaxed">
                {result.roadmap}
              </div>
              {result.highlights && result.highlights.length > 0 && (
                <dl className="divide-y rounded-xl border bg-card">
                  {result.highlights.map((h) => (
                    <div key={h.label} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[11rem_1fr] sm:gap-4">
                      <dt className="font-semibold text-foreground">{h.label}</dt>
                      <dd className="whitespace-pre-line text-muted-foreground">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="flex items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-center text-sm text-foreground">
                <Mail className="h-4 w-4 shrink-0 text-success" />
                {result.emailSent
                  ? `We just emailed a copy to ${email.trim()}, and our team will be in touch.`
                  : result.leadNotificationSent
                    ? "Our team received your results and will reach out at the email you provided."
                    : "Save this page for your records."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <a href={cta.href} target="_blank" rel="noopener noreferrer">
                    {cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
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

  const cardClass = "rounded-2xl border-primary/10 shadow-lg shadow-primary/5"
  const optionClass =
    "group flex cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.03] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
  const letterClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-semibold text-muted-foreground transition-colors"

  return (
    <div className="bg-gradient-to-b from-primary/[0.06] via-background to-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          {eyebrow && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {eyebrow}
            </span>
          )}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand/80 text-brand-foreground shadow-md shadow-brand/20">
              {icon}
            </div>
            <div>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {!isLoading && wizardSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  {currentStep?.type === "question"
                    ? `Question ${currentStep.questionIndex + 1} of ${questionCount}`
                    : "Last step — your results"}
                </span>
                <span className="text-primary">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5" />
            </div>
          )}
        </div>

        {isLoading ? (
          <Card className={cardClass}>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card className={cardClass}>
            <CardContent className="py-8 text-center text-destructive">
              Could not load questions. Please try again later.
            </CardContent>
          </Card>
        ) : !questionCount || !currentStep ? (
          <Card className={cardClass}>
            <CardContent className="py-8 text-center text-muted-foreground">
              No questions available yet.
            </CardContent>
          </Card>
        ) : currentStep.type === "question" && currentQuestion ? (
          <Card
            key={currentQuestion.id}
            className={`${cardClass} animate-in fade-in slide-in-from-right-4 duration-300`}
          >
            <CardHeader>
              <CardTitle className="text-xl leading-snug">{currentQuestion.prompt}</CardTitle>
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
                        className={`${optionClass} ${
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                        }`}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleMultiple(currentQuestion.id, option.id)}
                          className="h-5 w-5"
                        />
                        <span className="text-sm font-medium leading-relaxed">{option.label}</span>
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
                  {currentQuestion.options.map((option, i) => (
                    <label
                      key={option.id}
                      htmlFor={`${currentQuestion.id}-${option.id}`}
                      className={`${optionClass} has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary`}
                    >
                      {/* The radio stays for keyboard and screen readers; the letter badge is the visual. */}
                      <RadioGroupItem
                        value={option.id}
                        id={`${currentQuestion.id}-${option.id}`}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={`${letterClass} group-has-[[data-state=checked]]:border-primary group-has-[[data-state=checked]]:bg-primary group-has-[[data-state=checked]]:text-primary-foreground`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium leading-relaxed">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" disabled={stepIndex === 0} onClick={goBack}>
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
          <Card className={`${cardClass} animate-in fade-in slide-in-from-right-4 duration-300`}>
            <CardHeader>
              <CardTitle className="text-xl">Your results are ready!</CardTitle>
              <CardDescription>
                Tell us where to send {resultsNoun}. We&apos;ll email them to you right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewLoading ? (
                <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : preview ? (
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-brand/[0.08] p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Your result
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                    {preview.resultTitle}
                  </p>
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
                    className="h-11"
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
                    className="h-11"
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
                {askLocation && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-county">County</Label>
                      <select
                        id="quiz-county"
                        value={county}
                        onChange={(e) => {
                          setCounty(e.target.value)
                          setTown("")
                        }}
                        required
                        className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="" disabled>
                          Choose county
                        </option>
                        {SERVICE_COUNTIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiz-town">Town</Label>
                      <select
                        id="quiz-town"
                        value={town}
                        onChange={(e) => setTown(e.target.value)}
                        required
                        disabled={!county}
                        className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>
                          {county ? "Choose town" : "Choose county first"}
                        </option>
                        {(SERVICE_AREA[county] ?? []).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="quiz-phone">
                    Phone number <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="quiz-phone"
                    className="h-11"
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
                  <Button type="button" variant="ghost" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!canSubmit}
                    className="shadow-lg shadow-primary/20"
                  >
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
