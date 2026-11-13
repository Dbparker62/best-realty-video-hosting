"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LogOut, BookOpen, LayoutDashboard, Phone } from "lucide-react"
import { useState } from "react"
import { LoginDialog } from "./login-dialog"
import { CONTACT, ONLINE_COURSES_URL } from "@/lib/site"
import { BrandLogo } from "./brand-logo"

export function Header() {
  const pathname = usePathname()
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
    canUseCustomerFeatures,
    isAdmin,
  } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <>
      {/* Announcement bar, like the school site */}
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 sm:text-sm lg:px-8">
          <a
            href={ONLINE_COURSES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-medium hover:underline"
          >
            Online Broker &amp; Salesperson Classes Available!
          </a>
          <a href={CONTACT.phoneHref} className="flex shrink-0 items-center gap-1.5 font-semibold hover:underline">
            <Phone className="h-3.5 w-3.5" />
            {CONTACT.phone}
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          {/* Logo */}
          <BrandLogo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            <a
              href={ONLINE_COURSES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Online Courses
            </a>
            <Link
              href="/how-to-get-a-real-estate-license-in-nj"
              className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              License Guide
            </Link>
            <Link
              href="/questionnaire"
              className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              License Quiz
            </Link>
            <Link
              href="/questionnaire/leadership"
              className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              Team / Broker Quiz
            </Link>
            {canUseCustomerFeatures && !authLoading && (
              <Link
                href="/my-courses"
                className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                My Courses
              </Link>
            )}
            {isAdmin && !authLoading && (
              <Link
                href="/admin"
                className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 lg:flex">
            {authLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canUseCustomerFeatures && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-courses" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        My Courses
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button asChild>
                  <Link href="/questionnaire">Free Quiz</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border lg:hidden">
            <div className="space-y-1 px-4 py-3">
              <a
                href={ONLINE_COURSES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Online Courses
              </a>
              <Link
                href="/how-to-get-a-real-estate-license-in-nj"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                License Guide
              </Link>
              <Link
                href="/questionnaire"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                License Quiz
              </Link>
              <Link
                href="/questionnaire/leadership"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Team / Broker Quiz
              </Link>
              {canUseCustomerFeatures && !authLoading && (
                <Link
                  href="/my-courses"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Courses
                </Link>
              )}
              {isAdmin && !authLoading && (
                <Link
                  href="/admin"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {authLoading ? (
                <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
              ) : isAuthenticated ? (
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true)
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  )
}
