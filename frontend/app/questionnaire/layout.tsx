import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Free NJ Real Estate Career Quiz",
  description:
    "Answer 4 quick questions to see if a full-time, part-time, or referral real estate career fits you — and get a free step-by-step New Jersey licensing roadmap by email.",
  path: "/questionnaire",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
