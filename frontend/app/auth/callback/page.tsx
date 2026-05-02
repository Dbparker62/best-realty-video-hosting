"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function exchangeCode() {
      const code = searchParams.get("code")

      if (!code) {
        setError("Missing authorization code")
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/callback?code=${encodeURIComponent(code)}`
        )

        if (!response.ok) {
          throw new Error("Failed to complete login")
        }

        const data = (await response.json()) as {
          access_token?: string
          id_token?: string
          refresh_token?: string
        }

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token)
        }
        if (data.id_token) {
          localStorage.setItem("id_token", data.id_token)
        }
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token)
        }

        window.location.assign("/my-courses")
      } catch {
        setError("Login failed. Please try again.")
      }
    }

    void exchangeCode()
  }, [searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-xl border p-6">
          <h1 className="text-xl font-semibold">Login failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Completing login...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
