/**
 * Lead attribution — remembers where a visitor came from (UTM tags, referrer,
 * in-app browser) so quiz submissions can say "this lead came from Instagram bio".
 *
 * Tag every link you post, e.g.
 *   https://yoursite.com/questionnaire?utm_source=instagram&utm_medium=bio
 *   https://yoursite.com/questionnaire?utm_source=youtube&utm_medium=description&utm_campaign=nj-license-video
 */

export interface LeadAttribution {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrer?: string
  landingPage?: string
  /** Best guess when there are no UTM tags (e.g. "instagram-app"). */
  inferredSource?: string
  capturedAt?: string
}

const STORAGE_KEY = "lead_attribution_v1"
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // keep for 30 days
const MAX_LEN = 300

const UTM_PARAMS: [keyof LeadAttribution, string][] = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmContent", "utm_content"],
  ["utmTerm", "utm_term"],
]

function clip(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, MAX_LEN) : undefined
}

/** Instagram/Facebook in-app browsers often strip the referrer — detect them by user agent. */
function inferSource(referrer: string | undefined): string | undefined {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  if (/Instagram/i.test(ua)) return "instagram-app"
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook-app"
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "tiktok-app"
  if (!referrer) return undefined
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    if (/(^|\.)instagram\.com$/.test(host)) return "instagram"
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host)) return "facebook"
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return "youtube"
    if (/(^|\.)google\./.test(host)) return "google"
    if (/(^|\.)bing\.com$/.test(host)) return "bing"
    return host
  } catch {
    return undefined
  }
}

function readStored(): LeadAttribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LeadAttribution
    const age = Date.now() - new Date(parsed.capturedAt ?? 0).getTime()
    return age >= 0 && age < MAX_AGE_MS ? parsed : null
  } catch {
    return null
  }
}

function store(value: LeadAttribution) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Private mode / storage blocked — attribution just won't persist across pages.
  }
}

let sessionAttribution: LeadAttribution | null = null

/**
 * Call once per page load. A visit with UTM tags or an outside referrer replaces
 * what was stored (last-touch); internal navigation keeps the stored value.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return

  const params = new URLSearchParams(window.location.search)
  const fromUrl: LeadAttribution = {}
  for (const [key, param] of UTM_PARAMS) {
    const value = clip(params.get(param))
    if (value) fromUrl[key] = value as never
  }

  let referrer = clip(document.referrer)
  if (referrer) {
    try {
      if (new URL(referrer).host === window.location.host) referrer = undefined
    } catch {
      referrer = undefined
    }
  }

  const hasUtm = Boolean(fromUrl.utmSource || fromUrl.utmMedium || fromUrl.utmCampaign)
  const inferred = inferSource(referrer)
  const existing = readStored()

  if (!hasUtm && !referrer && existing) {
    // Internal navigation or a repeat direct visit — keep the original source.
    sessionAttribution = existing
    return
  }

  sessionAttribution = {
    ...fromUrl,
    referrer,
    inferredSource: inferred,
    landingPage: clip(window.location.pathname + window.location.search),
    capturedAt: new Date().toISOString(),
  }
  store(sessionAttribution)
}

export function getAttribution(): LeadAttribution | null {
  if (typeof window === "undefined") return null
  return sessionAttribution ?? readStored()
}

/** Shape the backend expects (snake_case). */
export function attributionPayload(): Record<string, string> | null {
  const a = getAttribution()
  if (!a) return null
  const payload: Record<string, string> = {}
  const map: [keyof LeadAttribution, string][] = [
    ["utmSource", "utm_source"],
    ["utmMedium", "utm_medium"],
    ["utmCampaign", "utm_campaign"],
    ["utmContent", "utm_content"],
    ["utmTerm", "utm_term"],
    ["referrer", "referrer"],
    ["landingPage", "landing_page"],
    ["inferredSource", "inferred_source"],
  ]
  for (const [key, apiKey] of map) {
    const value = a[key]
    if (value) payload[apiKey] = value
  }
  return Object.keys(payload).length ? payload : null
}
