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

export interface QuestionnaireSubmitResult {
  submissionId: string
  name: string
  readinessLabel: string
  careerPath: string
  careerPathTitle: string
  roadmap: string
  score: number
  maxScore: number
  emailSent: boolean
}

export interface QuestionnaireSubmissionAdmin {
  id: string
  name: string
  email: string
  readinessPercent: number
  readinessLabel: string
  careerPath?: string
  score: number
  maxScore: number
  createdAt: string
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

export async function submitQuestionnaire(payload: {
  name: string
  email: string
  answers: { questionId: string; optionIds: string[] }[]
}): Promise<QuestionnaireSubmitResult> {
  const response = await fetch(`${API_BASE_URL}/questionnaire/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
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
    email_sent: boolean
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
    emailSent: data.email_sent,
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
    name: string
    email: string
    readiness_percent: number
    readiness_label: string
    career_path?: string
    score: number
    max_score: number
    created_at: string
  }[]
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    readinessPercent: row.readiness_percent,
    readinessLabel: row.readiness_label,
    careerPath: row.career_path,
    score: row.score,
    maxScore: row.max_score,
    createdAt: row.created_at,
  }))
}
