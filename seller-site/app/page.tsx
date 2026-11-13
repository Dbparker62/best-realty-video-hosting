import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, Home, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DirectorSection } from "@/components/director-section"
import { FaqSection, faqJsonLd } from "@/components/faq-section"
import { JsonLd } from "@/components/json-ld"
import { HOME_SALE_FAQ, HOME_SALE_LEARN } from "@/lib/home-sale-content"
import { CONTACT, QUIZ_PATH, SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({ title: { absolute: `Sell Your New Jersey Home | ${SITE_NAME}` }, description: SITE_DESCRIPTION, path: "/" })
const steps = [
  { icon: Clock, title: "Answer 15 quick questions", body: "Tell us about your home, its condition, and your plans. It takes about three minutes." },
  { icon: CheckCircle2, title: "See your top priorities", body: "Get a readiness score and a practical plan to help prepare your home for sale." },
  { icon: Home, title: "Plan your next move", body: "Review your report and talk with us about your timeline and questions." },
]

export default function HomePage() {
  return <>
    <JsonLd data={faqJsonLd(HOME_SALE_FAQ)} />
    <section className="relative overflow-hidden bg-white">
      <Home aria-hidden className="pointer-events-none absolute -bottom-10 -right-16 hidden h-96 w-96 text-brand opacity-[0.04] lg:block" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">Best Realty New Jersey · Home Seller Resources</p>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">Get Your <span className="text-brand">New Jersey</span> Home Ready to Sell</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Know what to fix, what to document, and what to discuss before you list. Start with a free home sale readiness report built around your answers.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base shadow-md shadow-primary/25"><Link href={QUIZ_PATH}>Take the Free Seller Quiz<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base"><a href={CONTACT.phoneHref}>Talk About Selling</a></Button>
          </div>
          <a href={CONTACT.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-primary" />Questions? Call {CONTACT.phone}</a>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-lg shadow-brand/5 sm:p-8">
          <h2 className="text-lg font-bold uppercase tracking-wide text-brand">Your next steps start here</h2>
          <ul className="mt-6 space-y-5">{steps.map(({ icon: Icon, title, body }) => <li key={title} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground"><Icon className="h-5 w-5" /></span><div><h3 className="font-bold">{title}</h3><p className="mt-0.5 text-sm text-muted-foreground">{body}</p></div></li>)}</ul>
        </div>
      </div>
    </section>
    <section className="bg-brand text-brand-foreground"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4">{["Free readiness report", "About 3 minutes", "No account needed", "No obligation"].map(text => <p key={text} className="font-semibold">{text}</p>)}</div></section>
    <section className="py-16 sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Before you list</p><h2 className="mt-2 text-3xl font-extrabold">A clearer plan for your home sale</h2><div className="mt-8 grid gap-4 sm:grid-cols-2">{HOME_SALE_LEARN.map(item => <div key={item} className="flex gap-3 rounded-2xl border bg-card p-6 shadow-sm"><CheckCircle2 className="h-6 w-6 shrink-0 text-brand" /><p>{item}</p></div>)}</div></div></section>
    <DirectorSection />
    <FaqSection title="Questions About Selling?" items={HOME_SALE_FAQ} />
    <section className="border-t py-16 text-center"><div className="mx-auto max-w-3xl px-4"><h2 className="text-2xl font-extrabold sm:text-3xl">How ready is your home to sell?</h2><p className="mt-4 text-muted-foreground">Find your starting point with the free Home Sale Readiness quiz.</p><Button asChild size="lg" className="mt-6"><Link href={QUIZ_PATH}>Get My Readiness Report<ArrowRight className="h-4 w-4" /></Link></Button></div></section>
  </>
}
