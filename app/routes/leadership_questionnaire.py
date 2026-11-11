from fastapi import APIRouter

from app.models import schemas
from app.services import leadership_questionnaire_service

router = APIRouter()


@router.get(
    "/leadership-questionnaire/questions",
    response_model=list[schemas.QuestionnaireQuestionPublicOut],
)
def get_leadership_questions():
    return leadership_questionnaire_service.list_questions()


@router.post(
    "/leadership-questionnaire/preview",
    response_model=schemas.QuestionnairePreviewOut,
)
def preview_leadership_questionnaire(body: schemas.QuestionnairePreviewIn):
    """Result teaser before the contact form — no save, no email."""
    return leadership_questionnaire_service.preview_answers(
        [{"question_id": a.question_id, "option_ids": a.option_ids} for a in body.answers]
    )


@router.post(
    "/leadership-questionnaire/submit",
    response_model=schemas.LeadershipQuestionnaireSubmitOut,
)
def submit_leadership_questionnaire(body: schemas.QuestionnaireSubmitIn):
    answers = [
        {"question_id": a.question_id, "option_ids": a.option_ids}
        for a in body.answers
    ]
    return leadership_questionnaire_service.submit(
        body.name,
        str(body.email),
        answers,
        phone=body.phone,
        attribution=(
            body.attribution.model_dump(exclude_none=True) if body.attribution else None
        ),
    )
