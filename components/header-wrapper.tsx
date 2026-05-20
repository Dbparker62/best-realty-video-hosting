"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

export function HeaderWrapper() {
  const pathname = usePathname()
  
  // Don't show customer header on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  return <Header />
}
