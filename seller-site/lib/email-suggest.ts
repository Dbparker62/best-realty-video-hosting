/**
 * Catch common email-domain typos ("gmial.com", "yahoo.con") before submit.
 * Typos bounce, and a high bounce rate can get the SES sending account paused.
 */

/** Suggestion targets. */
const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "comcast.net",
  "verizon.net",
  "optonline.net",
  "live.com",
  "msn.com",
  "me.com",
]

/** Real domains that look like typos of the ones above — never "correct" these. */
const ALSO_VALID = new Set([
  "ymail.com",
  "rocketmail.com",
  "mac.com",
  "aim.com",
  "att.net",
  "sbcglobal.net",
  "gmx.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "live.net",
])

/** Known misspellings that edit distance alone might miss or mis-rank. */
const KNOWN_TYPOS: Record<string, string> = {
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "yahoo.co": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      // Adjacent swap ("gmial" → "gmail") counts as one edit.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1)
      }
    }
  }
  return dp[a.length][b.length]
}

/** Returns a corrected address, or null if the email looks fine. */
export function suggestEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.lastIndexOf("@")
  if (at < 1 || at === trimmed.length - 1) return null

  const local = trimmed.slice(0, at)
  let domain = trimmed.slice(at + 1)
  if (COMMON_DOMAINS.includes(domain) || ALSO_VALID.has(domain)) return null

  // ".con", ".cmo", ".comm" → ".com"
  const fixedTld = domain.replace(/\.(con|cmo|ocm|comm|co,)$/, ".com")
  if (fixedTld !== domain) {
    domain = fixedTld
    if (COMMON_DOMAINS.includes(domain)) return `${local}@${domain}`
  }

  if (KNOWN_TYPOS[domain]) return `${local}@${KNOWN_TYPOS[domain]}`

  let best: string | null = null
  let bestDistance = Infinity
  for (const candidate of COMMON_DOMAINS) {
    const d = editDistance(domain, candidate)
    if (d < bestDistance) {
      best = candidate
      bestDistance = d
    }
  }
  // Close to a common provider → probably meant it. Short names only get one
  // edit of slack so real domains like "msn.com" vs "me.com" aren't "fixed".
  const allowed = best && best.length >= 9 ? 2 : 1
  if (best && bestDistance > 0 && bestDistance <= allowed) return `${local}@${best}`

  return fixedTld !== trimmed.slice(at + 1) ? `${local}@${domain}` : null
}
