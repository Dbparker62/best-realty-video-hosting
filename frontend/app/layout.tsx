import type { Metadata } from 'next'
import { Montserrat, Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TrackingScripts } from '@/components/tracking-scripts'
import { JsonLd } from '@/components/json-ld'
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/site'
import './globals.css'

// Same fonts as bestschoolofrealestate.biz: Montserrat headings, Roboto body.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
})
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

// No canonical here — it would be inherited by every page. Pages set their own.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `New Jersey Real Estate License Courses | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-icon.png',
  },
}

/** Tells Google who runs the site (name, logo, area served, social profiles). */
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/school-logo-red.jpg`,
      description: SITE_DESCRIPTION,
      areaServed: { '@type': 'State', name: 'New Jersey' },
      telephone: CONTACT.phone,
      email: CONTACT.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.city,
        addressRegion: CONTACT.address.region,
        postalCode: CONTACT.address.postalCode,
        addressCountry: 'US',
      },
      ...(SOCIAL_LINKS.length > 0 ? { sameAs: SOCIAL_LINKS.map((s) => s.href) } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${montserrat.variable} ${roboto.variable} font-sans antialiased`}>
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <TrackingScripts />
      </body>
    </html>
  )
}
