import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "NJ Real Estate Career Quiz – Free 2-Minute Assessment",
  description:
    "Thinking about becoming a real estate agent in New Jersey? Take our free 2-minute career quiz and discover your next steps toward getting licensed.",
  path: "/questionnaire",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
