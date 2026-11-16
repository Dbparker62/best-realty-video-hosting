import { attributionPayload } from "./attribution"
import { API_BASE_URL, authHeaders, parseApiError } from "./api"

export interface QuestionnaireOption {
  id: string
  label: string
}

export interface QuestionnaireOptionAdmin extends QuestionnaireOption {
  points: number
}

export interface QuestionnaireQuestion {
  id: string
  orderIndex: number
  prompt: string
  subtitle: string
  allowMultiple: boolean
  options: QuestionnaireOption[]
}

export interface QuestionnaireQuestionAdmin {
  id: string
  orderIndex: number
  prompt: string
  isActive: boolean
  options: QuestionnaireOptionAdmin[]
}

/** Two-sided result bar. position 0 = fully left, 100 = fully right. */
export interface ResultLean {
  leftLabel: string
  rightLabel: string
  position: number
}

/** Result teaser shown before the contact form (nothing saved or emailed). */
export interface QuizPreview {
  result: string
  resultTitle: string
  teaser: string
  lean?: ResultLean
}

type ResultLeanApi = { left_label: string; right_label: string; position: number }

export function mapLean(raw: ResultLeanApi | null | undefined): ResultLean | undefined {
  if (!raw) return undefined
  return { leftLabel: raw.left_label, rightLabel: raw.right_label, position: raw.position }
}

export interface QuestionnaireSubmitResult {
  submissionId: string
  name: string
  readinessLabel: string
  careerPath: string
  careerPathTitle: string
  roadmap: string
  score: number
  maxScore: number
  lean?: ResultLean
  emailSent: boolean
  leadNotificationSent: boolean
}

export type QuizType = "career" | "leadership" | "home_sale"

/** One saved quiz lead (any of the three quizzes), as shown in the admin table. */
export interface QuestionnaireSubmissionAdmin {
  id: string
  quizType: QuizType
  quiz: string
  name: string
  email: string
  phone: string
  town: string
  result: string
  /** true = agreed to be contacted; null = submitted before the checkbox existed. */
  contactConsent: boolean | null
  createdAt: string
}

export interface LeadExportFilters {
  quiz?: QuizType
  /** YYYY-MM-DD, Eastern time. */
  since?: string
  consentOnly?: boolean
}

interface QuestionPublicApi {
  id: string
  order_index: number
  prompt: string
  subtitle?: string
  allow_multiple?: boolean
  options: { id: string; label: string }[]
}

interface QuestionAdminApi {
  id: string
  order_index: number
  prompt: string
  is_active?: boolean
  options: { id: string; label: string; points: number }[]
}

function mapQuestion(raw: QuestionPublicApi): QuestionnaireQuestion {
  return {
    id: raw.id,
    orderIndex: raw.order_index,
    prompt: raw.prompt,
    subtitle: raw.subtitle ?? "",
    allowMultiple: Boolean(raw.allow_multiple),
    options: raw.options.map((o) => ({ id: o.id, label: o.label })),
  }
}

function mapQuestionAdmin(raw: QuestionAdminApi): QuestionnaireQuestionAdmin {
  return {
    id: raw.id,
    orderIndex: raw.order_index,
    prompt: raw.prompt,
    isActive: raw.is_active ?? true,
    options: raw.options.map((o) => ({
      id: o.id,
      label: o.label,
      points: o.points,
    })),
  }
}

export async function getQuestionnaireQuestions(): Promise<QuestionnaireQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/questionnaire/questions`)
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as QuestionPublicApi[]
  return data.map(mapQuestion)
}

export async function previewQuestionnaire(
  answers: { questionId: string; optionIds: string[] }[]
): Promise<QuizPreview> {
  const response = await fetch(`${API_BASE_URL}/questionnaire/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: answers.map((a) => ({ question_id: a.questionId, option_ids: a.optionIds })),
    }),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as {
    result: string
    result_title: string
    teaser: string
    lean?: ResultLeanApi | null
  }
  return {
    result: data.result,
    resultTitle: data.result_title,
    teaser: data.teaser,
    lean: mapLean(data.lean),
  }
}

export async function submitQuestionnaire(payload: {
  name: string
  email: string
  phone?: string
  contactConsent: boolean
  consentText: string
  answers: { questionId: string; optionIds: string[] }[]
}): Promise<QuestionnaireSubmitResult> {
  const response = await fetch(`${API_BASE_URL}/questionnaire/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      contact_consent: payload.contactConsent,
      contact_consent_text: payload.consentText,
      attribution: attributionPayload(),
      answers: payload.answers.map((a) => ({
        question_id: a.questionId,
        option_ids: a.optionIds,
      })),
    }),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as {
    submission_id: string
    name: string
    readiness_label: string
    career_path: string
    career_path_title: string
    roadmap: string
    score: number
    max_score: number
    lean?: ResultLeanApi | null
    email_sent: boolean
    lead_notification_sent: boolean
  }
  return {
    submissionId: data.submission_id,
    name: data.name,
    readinessLabel: data.readiness_label,
    careerPath: data.career_path,
    careerPathTitle: data.career_path_title,
    roadmap: data.roadmap,
    score: data.score,
    maxScore: data.max_score,
    lean: mapLean(data.lean),
    emailSent: data.email_sent,
    leadNotificationSent: data.lead_notification_sent,
  }
}

export async function getAdminQuestionnaireQuestions(): Promise<
  QuestionnaireQuestionAdmin[]
> {
  const response = await fetch(`${API_BASE_URL}/admin/questionnaire/questions`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as QuestionAdminApi[]
  return data.map(mapQuestionAdmin)
}

export async function createAdminQuestionnaireQuestion(body: {
  prompt: string
  orderIndex: number
  isActive: boolean
  options: QuestionnaireOptionAdmin[]
}): Promise<QuestionnaireQuestionAdmin> {
  const response = await fetch(`${API_BASE_URL}/admin/questionnaire/questions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      prompt: body.prompt,
      order_index: body.orderIndex,
      is_active: body.isActive,
      options: body.options.map((o) => ({
        id: o.id,
        label: o.label,
        points: o.points,
      })),
    }),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as QuestionAdminApi
  return mapQuestionAdmin(data)
}

export async function updateAdminQuestionnaireQuestion(
  questionId: string,
  body: Partial<{
    prompt: string
    orderIndex: number
    isActive: boolean
    options: QuestionnaireOptionAdmin[]
  }>
): Promise<QuestionnaireQuestionAdmin> {
  const payload: Record<string, unknown> = {}
  if (body.prompt !== undefined) payload.prompt = body.prompt
  if (body.orderIndex !== undefined) payload.order_index = body.orderIndex
  if (body.isActive !== undefined) payload.is_active = body.isActive
  if (body.options !== undefined) {
    payload.options = body.options.map((o) => ({
      id: o.id,
      label: o.label,
      points: o.points,
    }))
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/questionnaire/questions/${questionId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }
  )
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as QuestionAdminApi
  return mapQuestionAdmin(data)
}

export async function deleteAdminQuestionnaireQuestion(
  questionId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/questionnaire/questions/${questionId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  )
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}

export async function getAdminQuestionnaireSubmissions(): Promise<
  QuestionnaireSubmissionAdmin[]
> {
  const response = await fetch(`${API_BASE_URL}/admin/questionnaire/submissions`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as {
    id: string
    quiz_type: QuizType
    quiz: string
    name: string
    email: string
    phone: string
    town: string
    result: string
    contact_consent?: boolean | null
    created_at: string
  }[]
  return (data ?? []).map((row) => ({
    id: row.id,
    quizType: row.quiz_type,
    quiz: row.quiz,
    name: row.name,
    email: row.email,
    phone: row.phone,
    town: row.town,
    result: row.result,
    contactConsent: row.contact_consent ?? null,
    createdAt: row.created_at,
  }))
}

/** Downloads the quiz leads CSV (Real Geeks import format) through the browser. */
export async function downloadQuizLeadsCsv(filters: LeadExportFilters = {}): Promise<void> {
  const params = new URLSearchParams()
  if (filters.quiz) params.set("quiz", filters.quiz)
  if (filters.since) params.set("since", filters.since)
  if (filters.consentOnly) params.set("consent_only", "true")
  const query = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/admin/questionnaire/submissions/export${query ? `?${query}` : ""}`,
    { headers: authHeaders() }
  )
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const disposition = response.headers.get("Content-Disposition") ?? ""
  const today = new Date().toISOString().slice(0, 10)
  const filename =
    /filename="([^"]+)"/.exec(disposition)?.[1] ??
    `quiz-leads-${(filters.quiz ?? "all").replace("_", "-")}-${today}.csv`
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
