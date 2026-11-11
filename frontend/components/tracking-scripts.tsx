"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { captureAttribution } from "@/lib/attribution"

// Public IDs (safe to commit). An env var overrides them; set it to an empty
// string to turn that tracker off. Only loads in production builds so local
// development doesn't pollute the real reports.
const IS_PROD = process.env.NODE_ENV === "production"
const GA_ID = IS_PROD
  ? (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-5QN8C82W42").trim()
  : ""
const META_PIXEL_ID = IS_PROD
  ? (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "973497453037443").trim()
  : ""

/**
 * Loads GA4 and the Meta Pixel when their IDs are set, records where the
 * visitor came from, and sends a Pixel PageView on every client-side navigation.
 */
export function TrackingScripts() {
  const pathname = usePathname()
  const captured = useRef(false)
  const firstPath = useRef(true)

  useEffect(() => {
    if (!captured.current) {
      captured.current = true
      captureAttribution()
    }
  }, [])

  useEffect(() => {
    // The Pixel snippet sends the first PageView itself; send one per later
    // client-side navigation. GA4 handles navigations via enhanced measurement.
    if (firstPath.current) {
      firstPath.current = false
      return
    }
    window.fbq?.("track", "PageView")
  }, [pathname])

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_ID)});`}
          </Script>
        </>
      )}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(META_PIXEL_ID)});
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  )
}
