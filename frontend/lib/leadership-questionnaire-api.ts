import { API_BASE_URL, parseApiError } from "./api"
import type { QuestionnaireQuestion } from "./questionnaire-api"

export interface LeadershipSubmitResult {
  submissionId: string
  name: string
  outcome: string
  outcomeTitle: string
  outcomeSummary: string
  roadmap: string
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

export async function getLeadershipQuestions(): Promise<QuestionnaireQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/leadership-questionnaire/questions`)
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
  const data = (await response.json()) as QuestionPublicApi[]
  return data.map(mapQuestion)
}

export async function submitLeadershipQuestionnaire(payload: {
  name: string
  email: string
  answers: { questionId: string; optionIds: string[] }[]
}): Promise<LeadershipSubmitResult> {
  const response = await fetch(`${API_BASE_URL}/leadership-questionnaire/submit`, {
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
    outcome: string
    outcome_title: string
    outcome_summary: string
    roadmap: string
    lead_notification_sent: boolean
  }
  return {
    submissionId: data.submission_id,
    name: data.name,
    outcome: data.outcome,
    outcomeTitle: data.outcome_title,
    outcomeSummary: data.outcome_summary,
    roadmap: data.roadmap,
    leadNotificationSent: data.lead_notification_sent,
  }
}
