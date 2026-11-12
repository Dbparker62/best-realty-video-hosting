import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Questions about New Jersey real estate pre-licensing courses or your account? Contact the Best School of Real Estate team.",
  path: "/contact",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
