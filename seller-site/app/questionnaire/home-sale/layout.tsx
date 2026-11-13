import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "NJ Home Sale Readiness Quiz – Free Seller Checklist",
  description:
    "Selling a home in New Jersey? Take our free quiz to get your readiness score, your top priorities, and a plan for your sale.",
  path: "/questionnaire/home-sale",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
