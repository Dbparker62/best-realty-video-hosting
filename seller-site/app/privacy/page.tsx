import type { ReactNode } from "react"
import { CONTACT, CONTACT_ADDRESS_LINE, SITE_NAME, pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Best Realty New Jersey collects, uses, shares, and protects information from the Home Sale Readiness quiz and this website.",
  path: "/privacy",
})

/** Change this whenever the policy text changes. */
const LAST_UPDATED = "November 16, 2026"

const listClass = "mt-3 list-disc space-y-2 pl-6"
const linkClass = "underline"

const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: "Information we collect",
    body: (
      <ul className={listClass}>
        <li>
          <strong>Quiz answers and contact details.</strong> When you take the Home Sale Readiness
          quiz, we collect your answers about your home and plans, your first name, email address,
          phone number (optional), county and town (optional), and a record of your agreement to be
          contacted, including the wording you agreed to and when.
        </li>
        <li>
          <strong>Visit and referral information.</strong> We collect the page you landed on, the
          website or ad that referred you, and campaign tags in the link (UTM tags). We save these in
          your browser so we can tell which ads and pages bring people to the quiz.
        </li>
        <li>
          <strong>Analytics data.</strong> We use Google Analytics and Vercel Analytics to measure page
          visits and quiz steps. We may also use advertising tools such as the Meta (Facebook) Pixel to
          measure our ads. These tools may set cookies and collect device, browser, and usage
          information. Your quiz answers, name, email, and phone number are never sent to these
          tools.
        </li>
      </ul>
    ),
  },
  {
    title: "How we use your information",
    body: (
      <ul className={listClass}>
        <li>To prepare your readiness score and report and email it to you.</li>
        <li>
          To follow up about selling your home and our real estate services by phone, text, or email,
          when you&apos;ve agreed to be contacted.
        </li>
        <li>To understand which pages and ads work, and to improve them.</li>
        <li>To keep the site secure and comply with the law.</li>
      </ul>
    ),
  },
  {
    title: "Phone calls and text messages",
    body: (
      <>
        <p>
          Before you submit the quiz, you check a box agreeing that {SITE_NAME} may contact you by
          phone, text message, or email, which may include automated calls or texts. We keep a record
          of that agreement. Message frequency varies, and message and data rates may apply.
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
            <strong>Our agents and staff,</strong> so a licensed Best Realty agent can follow up with
            you.
          </li>
          <li>
            <strong>Service providers that work for us.</strong> These include website hosting
            (Vercel), our database and email delivery (Amazon Web Services), our customer relationship
            management system (Real Geeks), and the analytics tools listed above. They may use your
            information only to provide services to us.
          </li>
          <li>
            <strong>People involved in your sale, with your permission,</strong> such as home
            inspectors, attorneys, or lenders you ask us to work with.
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
        <ul className={listClass}>
          <li>
            Google: install the{" "}
            <a className={linkClass} href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics opt-out browser add-on
            </a>{" "}
            or visit{" "}
            <a className={linkClass} href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">
              My Ad Center
            </a>
            .
          </li>
          <li>
            Meta: adjust your{" "}
            <a className={linkClass} href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">
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
        We keep quiz information for as long as it&apos;s useful for following up with you and running
        our business, and longer where real estate or other laws require records. When we no longer
        need information, we delete it or remove details that identify you.
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
        This site is for adults. We don&apos;t knowingly collect personal information from children
        under 13.
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
          <a className={linkClass} href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </li>
        <li>
          Phone:{" "}
          <a className={linkClass} href={CONTACT.phoneHref}>
            {CONTACT.phone}
          </a>
        </li>
      </ul>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <p className="mt-6 leading-relaxed">
        This policy explains how {SITE_NAME} (&quot;we,&quot; &quot;us&quot;) collects, uses, and
        shares information when you visit this website or take our Home Sale Readiness quiz.
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-xl font-bold">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 leading-relaxed text-muted-foreground">{s.body}</div>
          </section>
        ))}
      </div>
    </article>
  )
}
