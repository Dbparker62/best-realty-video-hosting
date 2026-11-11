"use client"

import { useEffect, useState } from "react"
import type { ResultLean } from "@/lib/questionnaire-api"

/**
 * Two-sided result bar, e.g. Referral ←→ Agent, with a marker showing where
 * the quiz taker landed. The marker slides in from the center on first render.
 */
export function ResultLeanBar({ lean, className = "" }: { lean: ResultLean; className?: string }) {
  const target = Math.max(0, Math.min(100, lean.position))
  const [shown, setShown] = useState(50)

  useEffect(() => {
    // Short delay so the browser paints the centered marker before it slides.
    const id = setTimeout(() => setShown(target), 80)
    return () => clearTimeout(id)
  }, [target])

  // Keep the marker fully visible at the extremes.
  const markerLeft = Math.max(3, Math.min(97, shown))
  const towardRight = target >= 50
  const percent = towardRight ? target : 100 - target
  const side = towardRight ? lean.rightLabel : lean.leftLabel

  return (
    <div className={className}>
      <div className="mb-2 flex justify-between text-xs font-medium">
        <span className={towardRight ? "text-muted-foreground" : "text-primary"}>
          {lean.leftLabel}
        </span>
        <span className={towardRight ? "text-primary" : "text-muted-foreground"}>
          {lean.rightLabel}
        </span>
      </div>
      <div
        className="relative h-3 rounded-full bg-gradient-to-r from-muted via-primary/30 to-primary"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={target}
        aria-label={`${percent}% ${side}`}
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-background/70" aria-hidden />
        <div
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-md transition-[left] duration-700 ease-out"
          style={{ left: `${markerLeft}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        You landed <span className="font-semibold text-foreground">{percent}% {side}</span>
      </p>
    </div>
  )
}
