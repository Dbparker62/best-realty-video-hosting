import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import {
  CONTACT,
  CONTACT_ADDRESS_LINE,
  SCHOOL_WEBSITE_URL,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/site"

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground"

const QUICK_LINKS = [
  { href: "/", label: "Browse Courses" },
  { href: "/questionnaire", label: "NJ Real Estate Career Quiz" },
  { href: "/questionnaire/leadership", label: "Team or Broker Quiz" },
]

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/contact", label: "Contact / Support" },
]

export function Footer() {
  return (
    <footer className="border-t-4 border-brand bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <BrandLogo />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Professional real estate education designed to help you pass your
              licensing exam and succeed in your career.
            </p>
            <ul className="mt-5 space-y-2.5">
              <li>
                <a href={CONTACT.phoneHref} className={`${linkClass} inline-flex items-center gap-2`}>
                  <Phone className="h-4 w-4 shrink-0" />
                  {CONTACT.phone}
                </a>
              </li>
              <li className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {CONTACT_ADDRESS_LINE}
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={`${linkClass} inline-flex items-center gap-2 break-all`}>
                  <Mail className="h-4 w-4 shrink-0" />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
            {SOCIAL_LINKS.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-4">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={SCHOOL_WEBSITE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Class Schedule &amp; Registration
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand">Legal</h3>
            <ul className="mt-4 space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
