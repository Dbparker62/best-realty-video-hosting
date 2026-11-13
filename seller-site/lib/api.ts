export const API_BASE_URL = "/api"

export async function parseApiError(response: Response): Promise<string> {
  const text = await response.text()
  try {
    const data = JSON.parse(text) as {
      error?: { message?: string; code?: string; details?: unknown }
      detail?: { error?: { message?: string; code?: string } }
    }
    const nested = data.error ?? data.detail?.error
    if (nested?.message) {
      const code = nested.code ? `[${nested.code}] ` : ""
      return `${code}${nested.message}`
    }
  } catch {
    // not JSON
  }
  return text || `Request failed (${response.status})`
}

