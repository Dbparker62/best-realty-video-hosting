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
    )
