import { Home } from "lucide-react"
import { CONTACT, SITE_NAME } from "@/lib/site"

export function DirectorSection({ heading = "Sell With an Experienced New Jersey Broker" }: { heading?: string }) {
  return <section id="about" className="bg-white py-16">
    <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Home aria-hidden className="mx-auto h-14 w-14 text-brand"/><p className="mt-4 font-bold text-brand">{SITE_NAME}</p>
        <p className="mt-6 text-lg font-semibold">Bruce Parker</p><p className="text-sm text-muted-foreground">Broker/Owner, Best Realty</p><p className="mt-1 text-sm text-muted-foreground">Highland Park, New Jersey</p>
      </div>
      <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{heading}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">Bruce Parker is the broker/owner of Best Realty in Highland Park. His experience in New Jersey real estate helps homeowners consider their next steps before putting a home on the market.</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">Start with your home sale readiness report, then talk with us about your priorities, questions, and timeline.</p>
        <a className="mt-6 inline-block font-semibold text-primary underline" href={CONTACT.phoneHref}>Talk to Bruce: {CONTACT.phone}</a>
      </div>
    </div>
  </section>
}
