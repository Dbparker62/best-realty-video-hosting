import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Team or Broker Quiz – Free 2-Minute Assessment",
  description:
    "Should you build a real estate team or become a broker of record in New Jersey? Take our free 2-minute quiz and get your leadership roadmap by email.",
  path: "/questionnaire/leadership",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
