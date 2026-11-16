import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CONTACT, CONTACT_ADDRESS_LINE, SITE_NAME, pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Best School of Real Estate collects, uses, shares, and protects information from our quizzes, courses, and website.",
  path: "/privacy",
})

/** Change this whenever the policy text changes. */
const LAST_UPDATED = "November 16, 2026"

type Section = { title: string; body: React.ReactNode }

const listClass = "mt-3 list-disc space-y-2 pl-6"

const SECTIONS: Section[] = [
  {
    title: "Information we collect",
    body: (
      <>
        <p>We collect information you give us and some information collected automatically:</p>
        <ul className={listClass}>
          <li>
            <strong>Quiz answers and contact details.</strong> When you take our Career Quiz or Team or
            Broker Quiz, we collect your answers, first name, email address, phone number (optional),
            and a record of your agreement to be contacted, including the wording you agreed to and
            when.
          </li>
          <li>
            <strong>Contact form messages.</strong> Your name, email, phone number (optional), and your
            message.
          </li>
          <li>
            <strong>Account and course information.</strong> If you create an account, we collect your
            name, email address, and login details, along with your course enrollments and progress.
          </li>
          <li>
            <strong>Payment information.</strong> Payments are handled by our payment processor. We
            don&apos;t receive or store your full card number.
          </li>
          <li>
            <strong>Visit and referral information.</strong> We collect the page you landed on, the
            website or ad that referred you, and campaign tags in the link (UTM tags). We save these in
            your browser so we can tell which ads and pages bring people to the quiz.
          </li>
          <li>
            <strong>Analytics and advertising data.</strong> We use Google Analytics, Vercel Analytics,
            and the Meta (Facebook) Pixel to measure page visits and quiz steps. These tools may set
            cookies and collect device, browser, and usage information. Your quiz answers, name, email,
            and phone number are never sent to these tools.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How we use your information",
    body: (
      <ul className={listClass}>
        <li>To prepare your quiz results and email them to you.</li>
        <li>
          To follow up about your results, our courses, and real estate careers by phone, text, or
          email, when you&apos;ve agreed to be contacted.
        </li>
        <li>To provide courses, track your progress, and process purchases.</li>
        <li>To answer your questions and support requests.</li>
        <li>To understand which pages, quizzes, and ads work, and to improve them.</li>
        <li>To keep the site secure and comply with the law.</li>
      </ul>
    ),
  },
  {
    title: "Phone calls and text messages",
    body: (
      <>
        <p>
          Before you submit a quiz, you check a box agreeing that {SITE_NAME} may contact you by phone,
          text message, or email, which may include automated calls or texts. We keep a record of that
          agreement. Message frequency varies, and message and data rates may apply.
        </p>
        <p className="mt-3">
          Reply <strong>STOP</strong> to any text to stop receiving texts, or <strong>HELP</strong> for
          help. You can also ask us to stop calling or emailing you at any time using the contact
          details below.
        </p>
        <p className="mt-3">
          We don&apos;t sell or share your mobile number or text-messaging consent with third parties
          or affiliates for their own marketing.
        </p>
      </>
    ),
  },
  {
    title: "Who we share information with",
    body: (
      <>
        <p>
          We don&apos;t sell your personal information. We share it only as needed to run our
          business:
        </p>
        <ul className={listClass}>
          <li>
            <strong>Our team.</strong> This includes the staff of Best Realty, the brokerage owned by
            our director, Bruce Parker, who may follow up with you about your results and real estate
            careers.
          </li>
          <li>
            <strong>Service providers that work for us.</strong> These include website hosting
            (Vercel), our database and email delivery (Amazon Web Services), our customer relationship
            management system (Real Geeks), payment processing, and the analytics and advertising
            tools listed above. They may use your information only to provide services to us.
          </li>
          <li>
            <strong>Online course provider.</strong> Our online pre-licensing and continuing education
            courses are sold and delivered through RECampus. Information you give RECampus is covered
            by its own privacy policy.
          </li>
          <li>
            <strong>Legal reasons.</strong> We may share information to comply with the law, respond to
            legal requests, or protect our rights and the safety of others.
          </li>
          <li>
            <strong>Business transfers.</strong> If our business is sold or merged, information may
            transfer to the new owner under this policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Cookies and advertising choices",
    body: (
      <>
        <p>
          Google and Meta may use information from their tools to measure and show ads, including ads
          on other websites and apps. You can limit this here:
        </p>
        <ul className={listClass}>
          <li>
            Google: install the{" "}
            <a className="underline" href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics opt-out browser add-on
            </a>{" "}
            or visit{" "}
            <a className="underline" href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">
              My Ad Center
            </a>
            .
          </li>
          <li>
            Meta: adjust your{" "}
            <a className="underline" href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">
              Facebook ad preferences
            </a>
            .
          </li>
          <li>You can also block or delete cookies in your browser settings.</li>
        </ul>
        <p className="mt-3">Our site does not currently respond to &quot;Do Not Track&quot; browser signals.</p>
      </>
    ),
  },
  {
    title: "How long we keep information",
    body: (
      <p>
        We keep quiz and contact information for as long as it&apos;s useful for following up with you
        and running our business, and course and payment records as long as the law requires. When we
        no longer need information, we delete it or remove details that identify you.
      </p>
    ),
  },
  {
    title: "Your choices and rights",
    body: (
      <>
        <p>
          You can ask us to show you the personal information we have about you, correct it, delete it,
          or give you a copy. You can also opt out of marketing calls, texts, and emails at any time.
          New Jersey residents may also have rights under the New Jersey Data Privacy Act, including
          the right to opt out of targeted advertising and the right to appeal our decision on a
          request.
        </p>
        <p className="mt-3">
          To make a request, contact us using the details below. We&apos;ll respond within 45 days and
          may need to confirm your identity first. If we deny your request, you can appeal by replying
          to our decision.
        </p>
      </>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        We use reasonable safeguards, including encrypted connections and access controls, to protect
        your information. No website or online service is completely secure.
      </p>
    ),
  },
  {
    title: "Children",
    body: (
      <p>
        Our site and courses are for adults. A New Jersey real estate license requires you to be at
        least 18. We don&apos;t knowingly collect personal information from children under 13.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy. When we do, we&apos;ll change the &quot;Last updated&quot; date at
        the top of this page.
      </p>
    ),
  },
  {
    title: "Contact us",
    body: (
      <ul className="mt-3 space-y-1">
        <li>{SITE_NAME}</li>
        <li>{CONTACT_ADDRESS_LINE}</li>
        <li>
          Email:{" "}
          <a className="underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </li>
        <li>
          Phone:{" "}
          <a className="underline" href={CONTACT.phoneHref}>
            {CONTACT.phone}
          </a>
        </li>
      </ul>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          This policy explains how {SITE_NAME} (&quot;we,&quot; &quot;us&quot;) collects, uses, and
          shares information when you visit our website, take one of our quizzes, contact us, or take
          our courses.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-foreground">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
