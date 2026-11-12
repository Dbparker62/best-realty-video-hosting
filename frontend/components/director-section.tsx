import Image from "next/image"
import { BadgeCheck } from "lucide-react"
import { DIRECTOR, DIRECTOR_BIO, PROOF_POINTS, SCHOOL_SUMMARY } from "@/lib/school-facts"

/** "Learn from an experienced NJ broker" block: bio + proof points. */
export function DirectorSection({
  heading = "Learn from an Experienced New Jersey Broker and Instructor",
  showProofPoints = true,
}: {
  heading?: string
  showProofPoints?: boolean
}) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <Image
              src="/school-logo-red.jpg"
              alt="Best School of Real Estate logo"
              width={628}
              height={480}
              className="mx-auto h-auto w-44"
            />
            <p className="mt-6 text-lg font-semibold text-foreground">{DIRECTOR.name}</p>
            <p className="text-sm text-muted-foreground">{DIRECTOR.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Broker/Owner, {DIRECTOR.brokerage} · {DIRECTOR.brokerageCity}, NJ
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{heading}</h2>
            {DIRECTOR_BIO.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            <p className="mt-4 flex gap-2 leading-relaxed text-muted-foreground">
              <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-brand" />
              {SCHOOL_SUMMARY}
            </p>
            {showProofPoints && (
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PROOF_POINTS.map((p) => (
                <div key={p.label} className="rounded-xl border bg-background p-4 text-center">
                  <dt className="sr-only">{p.label}</dt>
                  <dd className="font-[family-name:var(--font-heading)] text-xl font-extrabold text-brand">{p.value}</dd>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{p.label}</dd>
                </div>
              ))}
            </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
