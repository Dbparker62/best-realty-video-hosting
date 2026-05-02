import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

        const data = await response.json()

        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("id_token", data.id_token)
        localStorage.setItem("refresh_token", data.refresh_token)

        navigate("/my-courses")
      } catch (err) {
        console.error(err)
        setError("Login failed. Please try again.")
      }
    }

    exchangeCode()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border p-6">
          <h1 className="text-xl font-semibold">Login failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Completing login...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  )
}