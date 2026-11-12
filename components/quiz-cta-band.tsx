import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Dark call-to-action band pointing to the career quiz. */
export function QuizCtaBand() {
  return (
    <section className="bg-foreground text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Is a real estate career right for you?
          </h2>
          <p className="mt-2 max-w-xl text-white/75">
            Take our free 2-minute quiz and get a personalized New Jersey licensing roadmap by email.
          </p>
        </div>
        <Button asChild size="lg" className="h-12 shrink-0 px-7 text-base">
          <Link href="/questionnaire">
            Take the Free Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
