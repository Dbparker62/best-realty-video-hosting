import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

/** Server-rendered FAQ (plain <details>, no JS) so the answers are in the page HTML. */
export function FaqSection({
  title,
  intro,
  items,
  className = "",
}: {
  title: string
  intro?: ReactNode
  items: { question: string; answer: string }[]
  className?: string
}) {
  return (
    <section className={`border-t bg-card py-16 ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {intro && <p className="mt-2 text-muted-foreground">{intro}</p>}
        <div className="mt-8 divide-y rounded-xl border bg-background">
          {items.map((item) => (
            <details key={item.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
                <h3 className="text-base">{item.question}</h3>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** FAQPage structured data for the same items. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}
