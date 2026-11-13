import Link from "next/link"
import { CONTACT, CONTACT_ADDRESS_LINE, SITE_NAME, QUIZ_PATH } from "@/lib/site"

export function Footer() {
  return <footer id="contact" className="border-t bg-white py-10">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
      <div><p className="font-bold text-brand">{SITE_NAME}</p><p className="mt-2 text-sm text-muted-foreground">{CONTACT_ADDRESS_LINE}</p><p className="mt-2"><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></p><a className="break-all text-sm underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap items-start gap-5 text-sm"><Link href="/">Home</Link><Link href={QUIZ_PATH}>Seller Quiz</Link><Link href="/privacy">Privacy</Link></nav>
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
    </div>
  </footer>
}
