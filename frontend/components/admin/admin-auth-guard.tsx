"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    cognitoConfigured,
  } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin sign-in</CardTitle>
            <CardDescription>
              Sign in with an account in the Cognito <strong>admin</strong> group.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              disabled={!cognitoConfigured}
              onClick={() => login()}
            >
              Sign in with Cognito
            </Button>
            {!cognitoConfigured && (
              <p className="text-center text-sm text-muted-foreground">
                Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_COGNITO_DOMAIN</code> and{" "}
                <code className="rounded bg-muted px-1">NEXT_PUBLIC_COGNITO_CLIENT_ID</code>.
              </p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Back to site</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>
              Your account is signed in, but it does not have the{" "}
              <strong>admin</strong> Cognito group. Users who are both admin and customer
              still need the admin group to open this panel—once it is present, admin
              access takes precedence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Return to site</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
