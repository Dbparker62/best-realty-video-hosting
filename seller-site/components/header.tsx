import Link from "next/link"
import { Home } from "lucide-react"
import { QUIZ_PATH, SITE_NAME } from "@/lib/site"

export function Header() {
  return <header className="border-b bg-white">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-3 font-bold text-brand"><Home aria-hidden className="h-8 w-8" /><span>{SITE_NAME}</span></Link>
      <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-5 text-sm font-semibold">
        <Link href="/">Home</Link><Link href="/#about">About</Link><Link href="/#contact">Contact</Link>
        <Link href={QUIZ_PATH} className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">Free Seller Quiz</Link>
      </nav>
    </div>
  </header>
}
