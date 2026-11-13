"use client"

/**
 * One place to send events. Each destination is optional:
 *  - GA4         → NEXT_PUBLIC_GA_MEASUREMENT_ID (funnel reports)
 *  - Meta Pixel  → NEXT_PUBLIC_META_PIXEL_ID (Instagram/Facebook ads + retargeting)
 *  - Vercel      → custom events show up on Vercel Pro plans; harmless otherwise
 *
 * Never pass names, emails, or phone numbers here.
 */

import { useEffect, useRef } from "react"
import { track as vercelTrack } from "@vercel/analytics"
import { getAttribution } from "./attribution"

type EventProps = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

function clean(props: EventProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(props)) {
    if (v !== undefined && v !== "") out[k] = v
  }
  return out
}

function sourceProps(): EventProps {
  const a = getAttribution()
  return {
    lead_source: a?.utmSource ?? a?.inferredSource ?? "direct",
    lead_medium: a?.utmMedium,
    lead_campaign: a?.utmCampaign,
  }
}

/** Meta's standard events (e.g. "Lead") are what ad optimisation keys off. */
const META_STANDARD_EVENTS: Record<string, string> = {
  quiz_submit: "Lead",
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return
  const payload = clean({ ...sourceProps(), ...props })

  try {
    window.gtag?.("event", name, payload)
  } catch {}

  try {
    const standard = META_STANDARD_EVENTS[name]
    if (standard) window.fbq?.("track", standard, payload)
    else window.fbq?.("trackCustom", name, payload)
  } catch {}

  try {
    vercelTrack(name, payload)
  } catch {}

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", name, payload)
  }
}

export type QuizName = "career" | "leadership" | "home_sale"

export type QuizStepInfo =
  | { type: "question"; questionId: string; questionNumber: number }
  | { type: "contact" }

/**
 * Funnel events for a quiz wizard:
 *   quiz_start → quiz_step_view (each step) → quiz_complete (reached contact form)
 *   → quiz_submit (lead captured) / quiz_submit_error
 * In GA4, build a Funnel exploration with these to see where people drop off.
 */
export function useQuizFunnelTracking(
  quiz: QuizName,
  step: QuizStepInfo | undefined,
  stepIndex: number,
  totalSteps: number
): void {
  const started = useRef(false)
  const completed = useRef(false)
  const furthest = useRef(-1)

  useEffect(() => {
    if (!step || totalSteps === 0) return

    if (!started.current) {
      started.current = true
      trackEvent("quiz_start", { quiz })
    }

    // Only count forward progress so "Back" clicks don't inflate step views.
    if (stepIndex <= furthest.current) return
    furthest.current = stepIndex

    trackEvent("quiz_step_view", {
      quiz,
      step_number: stepIndex + 1,
      total_steps: totalSteps,
      step_type: step.type,
      question_id: step.type === "question" ? step.questionId : undefined,
      question_number: step.type === "question" ? step.questionNumber : undefined,
    })

    if (step.type === "contact" && !completed.current) {
      completed.current = true
      trackEvent("quiz_complete", { quiz })
    }
  }, [quiz, step, stepIndex, totalSteps])
}

export function trackQuizSubmit(quiz: QuizName, result: string): void {
  trackEvent("quiz_submit", { quiz, result })
  // GA4 recommended event name for lead forms.
  try {
    window.gtag?.("event", "generate_lead", clean({ ...sourceProps(), quiz, result }))
  } catch {}
}

export function trackQuizSubmitError(quiz: QuizName): void {
  trackEvent("quiz_submit_error", { quiz })
}
