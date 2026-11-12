import { API_BASE_URL } from "./api"
import { attributionPayload } from "./attribution"

export interface ContactMessage {
  name: string
  email: string
  phone?: string
  subject: string
  orderNumber?: string
  message: string
  /** Honeypot: hidden from people, often filled in by bots. */
  website?: string
}

/** Sends a contact-form message to staff by email. Throws a readable error on failure. */
export async function sendContactMessage(msg: ContactMessage): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: msg.name,
        email: msg.email,
        phone: msg.phone || null,
        subject: msg.subject || "general",
        order_number: msg.orderNumber || null,
        message: msg.message,
        website: msg.website || null,
        attribution: attributionPayload(),
      }),
    })
  } catch {
    throw new Error("We couldn't reach the server. Please check your connection and try again.")
  }

  if (response.ok) return

  let detail = ""
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === "string") detail = data.detail
    else if (Array.isArray(data.detail)) detail = "Please check the form — an email or field looks invalid."
  } catch {
    // not JSON
  }
  throw new Error(detail || "We couldn't send your message right now. Please call or email us instead.")
}
