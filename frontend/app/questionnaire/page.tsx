"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getQuestionnaireQuestions,
  submitQuestionnaire,
  type QuestionnaireSubmitResult,
} from "@/lib/questionnaire-api"

export default function QuestionnairePage() {
  const { data: questions, isLoading, error } = useSWR(
    "questionnaire-questions",
    getQuestionnaireQuestions
  )

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<QuestionnaireSubmitResult | null>(null)

  const totalSteps = (questions?.length ?? 0) + 1
  const onQuestionStep = questions && step < questions.length
  const currentQuestion = onQuestionStep ? questions[step] : null
  const progressPercent = totalSteps > 0 ? Math.round(((step + 1) / totalSteps) * 100) : 0

  const allQuestionsAnswered = useMemo(() => {
    if (!questions?.length) return false
    return questions.every((q) => Boolean(answers[q.id]))
  }, [questions, answers])

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
          optionId: answers[q.id],
        })),
      })
      setResult(payload)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit")
    } finally {
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (!currentQuestion || !answers[currentQuestion.id]) return
    setStep((s) => s + 1)
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
              <CardTitle className="text-2xl">Your Real Estate Readiness Score</CardTitle>
              <CardDescription>
                Hi {result.name}, here is how ready you are to join real estate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-5xl font-bold text-primary">{result.readinessPercent}%</p>
                <p className="mt-3 text-muted-foreground">{result.readinessLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.score} of {result.maxScore} points
                </p>
              </div>
              {result.emailSent ? (
                <p className="rounded-lg bg-muted px-4 py-3 text-sm">
                  We emailed your results to you. Check your inbox.
                </p>
              ) : (
                <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Save this score — email delivery is not configured yet.
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <h1 className="text-2xl font-bold text-foreground">
                Real Estate Readiness Quiz
              </h1>
              <p className="text-sm text-muted-foreground">
                Multiple choice — one question at a time. Your score shows how ready you are to join real estate.
              </p>
            </div>
          </div>
          {!isLoading && questions && questions.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Step {Math.min(step + 1, totalSteps)} of {totalSteps}
                </span>
                <span>{progressPercent}%</span>
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
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-destructive">
              Could not load questions. Please try again later.
            </CardContent>
          </Card>
        ) : !questions?.length ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No questions available yet.
            </CardContent>
          </Card>
        ) : onQuestionStep && currentQuestion ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-snug">{currentQuestion.prompt}</CardTitle>
              <CardDescription>Select the answer that best describes you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={answers[currentQuestion.id] ?? ""}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
                }
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

              <div className="flex justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  disabled={!answers[currentQuestion.id]}
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Get your readiness score</CardTitle>
              <CardDescription>
                Enter your name and email to see how ready you are to join real estate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}
                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !allQuestionsAnswered || !name.trim() || !email.trim()}
                  >
                    {submitting ? "Calculating…" : "See my score"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
