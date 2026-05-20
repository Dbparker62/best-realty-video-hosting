/**
 * Builds Cognito Hosted UI authorize URL. Requires env vars matching your Cognito app client.
 * Backend token exchange must use the same redirect URI (COGNITO_REDIRECT_URI on the API).
 */
export function getCognitoLoginUrl(): string | null {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
  const redirectUri =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? `${window.location.origin}/auth/callback`
      : process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI

  if (!domain || !clientId || !redirectUri) {
    return null
  }

  const base = domain.replace(/\/$/, "")
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: redirectUri,
  })

  return `${base}/oauth2/authorize?${params.toString()}`
}
