export interface QuestionnaireOption {
  id: string
  label: string
}


export interface QuestionnaireQuestion {
  id: string
  orderIndex: number
  prompt: string
  subtitle: string
  allowMultiple: boolean
  options: QuestionnaireOption[]
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

