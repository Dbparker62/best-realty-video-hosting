from fastapi import APIRouter

from app.models import schemas
from app.services import questionnaire_service

router = APIRouter()


@router.get(
    "/questionnaire/questions",
    response_model=list[schemas.QuestionnaireQuestionPublicOut],
)
def get_questionnaire_questions():
    """Public active questions (multiple choice, no point values exposed)."""
    return questionnaire_service.list_active_questions()


@router.post(
    "/questionnaire/submit",
    response_model=schemas.QuestionnaireSubmitOut,
)
def submit_questionnaire(body: schemas.QuestionnaireSubmitIn):
    """Score answers and optionally email the readiness result."""
    answers = [
        {"question_id": a.question_id, "option_id": a.option_id}
        for a in body.answers
    ]
    return questionnaire_service.submit_questionnaire(
        body.name,
        str(body.email),
        answers,
    )
