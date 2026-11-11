import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { HOME_FAQ } from "@/lib/faq"

/** Server-rendered FAQ (plain <details>, no JS) so the answers are in the page HTML. */
export function HomeFaq() {
  return (
    <section className="border-t bg-card py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground">
          New Jersey Real Estate License FAQ
        </h2>
        <p className="mt-2 text-muted-foreground">
          Not sure where to start?{" "}
          <Link href="/questionnaire" className="font-medium text-primary underline-offset-4 hover:underline">
            Take the free career quiz
          </Link>
          .
        </p>
        <div className="mt-8 divide-y rounded-xl border bg-background">
          {HOME_FAQ.map((item) => (
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
