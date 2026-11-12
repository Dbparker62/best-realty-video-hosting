import { attributionPayload } from "./attribution"
import { API_BASE_URL, parseApiError } from "./api"
import {
  mapLean,
  type QuestionnaireQuestion,
  type QuizPreview,
  type ResultLean,
} from "./questionnaire-api"

type LeanApi = { left_label: string; right_label: string; position: number } | null | undefined

export interface HomeSaleSubmitResult {
  name: string
  readinessScore: number
  readinessLabel: string
  title: string
  summary: string
  roadmap: string
  priorities: string[]
  negotiationPlan: string[]
  listingTiming: string
  lean?: ResultLean
  emailSent: boolean
  leadNotificationSent: boolean
}

interface QuestionPublicApi {
  id: string
  order_index: number
  prompt: string
  subtitle?: string
  allow_multiple?: boolean
  options: { id: string; label: string }[]
}

const toApiAnswers = (answers: { questionId: string; optionIds: string[] }[]) =>
  answers.map((a) => ({ question_id: a.questionId, option_ids: a.optionIds }))

export async function getHomeSaleQuestions(): Promise<QuestionnaireQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/home-sale-questionnaire/questions`)
  if (!response.ok) throw new Error(await parseApiError(response))
  const data = (await response.json()) as QuestionPublicApi[]
  return data.map((raw) => ({
    id: raw.id,
    orderIndex: raw.order_index,
    prompt: raw.prompt,
    subtitle: raw.subtitle ?? "",
    allowMultiple: Boolean(raw.allow_multiple),
    options: raw.options.map((o) => ({ id: o.id, label: o.label })),
  }))
}

export async function previewHomeSaleQuestionnaire(
  answers: { questionId: string; optionIds: string[] }[]
): Promise<QuizPreview> {
  const response = await fetch(`${API_BASE_URL}/home-sale-questionnaire/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: toApiAnswers(answers) }),
  })
  if (!response.ok) throw new Error(await parseApiError(response))
  const data = (await response.json()) as { result: string; result_title: string; teaser: string; lean?: LeanApi }
  return { result: data.result, resultTitle: data.result_title, teaser: data.teaser, lean: mapLean(data.lean) }
}

export async function submitHomeSaleQuestionnaire(payload: {
  name: string
  email: string
  phone?: string
  county: string
  town: string
  answers: { questionId: string; optionIds: string[] }[]
}): Promise<HomeSaleSubmitResult> {
  const response = await fetch(`${API_BASE_URL}/home-sale-questionnaire/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      county: payload.county,
      town: payload.town,
      attribution: attributionPayload(),
      answers: toApiAnswers(payload.answers),
    }),
  })
  if (!response.ok) throw new Error(await parseApiError(response))
  const d = (await response.json()) as {
    name: string
    readiness_score: number
    readiness_label: string
    title: string
    summary: string
    roadmap: string
    priorities?: string[]
    negotiation_plan?: string[]
    listing_timing?: string
    lean?: LeanApi
    email_sent?: boolean
    lead_notification_sent?: boolean
  }
  return {
    name: d.name,
    readinessScore: d.readiness_score,
    readinessLabel: d.readiness_label,
    title: d.title,
    summary: d.summary,
    roadmap: d.roadmap,
    priorities: d.priorities ?? [],
    negotiationPlan: d.negotiation_plan ?? [],
    listingTiming: d.listing_timing ?? "",
    lean: mapLean(d.lean),
    emailSent: Boolean(d.email_sent),
    leadNotificationSent: Boolean(d.lead_notification_sent),
  }
}
