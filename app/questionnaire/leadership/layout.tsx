import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Build a Team or Become a Broker? Free Quiz",
  description:
    "5 quick questions to find out whether building a real estate team or becoming a broker of record fits your goals in New Jersey. Free results by email.",
  path: "/questionnaire/leadership",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
