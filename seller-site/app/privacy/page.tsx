import { CONTACT, SITE_NAME, pageMetadata } from "@/lib/site"
export const metadata = pageMetadata({ title: "Privacy", description: "How information submitted through the seller quiz is used.", path: "/privacy" })

export default function PrivacyPage() {
  return <article className="mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-3xl font-bold">Privacy and Your Seller Quiz</h1>
    <p className="mt-6 leading-relaxed">When you submit the quiz, {SITE_NAME} collects your name, email, phone number if provided, county, town, and quiz answers. We use this information to prepare your readiness report and respond to your interest in selling a home.</p>
    <h2 className="mt-8 text-xl font-bold">Reports and follow-up</h2>
    <p className="mt-3 leading-relaxed">Your submission is stored in our shared backend system. Results are emailed to you, and a lead notification is sent to our team so we can follow up. Hosting, database, and email providers process information to operate these services.</p>
    <h2 className="mt-8 text-xl font-bold">Website analytics</h2>
    <p className="mt-3 leading-relaxed">The site records referral and campaign information associated with your visit and quiz submission. When configured, analytics and advertising tools also measure page visits and quiz interactions. Referral information may be stored in your browser.</p>
    <h2 className="mt-8 text-xl font-bold">Questions or requests</h2>
    <p className="mt-3 leading-relaxed">To ask about your information or request that we stop contacting you, email <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call <a className="underline" href={CONTACT.phoneHref}>{CONTACT.phone}</a>.</p>
  </article>
}
