from fastapi import APIRouter

from app.models import schemas
from app.services import home_sale_questionnaire_service as service

router = APIRouter()


@router.get(
    "/home-sale-questionnaire/questions",
    response_model=list[schemas.QuestionnaireQuestionPublicOut],
)
def get_home_sale_questions():
    return service.list_questions()


@router.post(
    "/home-sale-questionnaire/preview",
    response_model=schemas.QuestionnairePreviewOut,
)
def preview_home_sale_questionnaire(body: schemas.QuestionnairePreviewIn):
    """Readiness score teaser before the contact form: no save, no email."""
    return service.preview_answers(
        [{"question_id": a.question_id, "option_ids": a.option_ids} for a in body.answers]
    )


@router.post(
    "/home-sale-questionnaire/submit",
    response_model=schemas.HomeSaleSubmitOut,
)
def submit_home_sale_questionnaire(body: schemas.HomeSaleSubmitIn):
    """Score answers, save the seller lead, and email results to the seller and staff."""
    return service.submit(
        body.name,
        str(body.email),
        [{"question_id": a.question_id, "option_ids": a.option_ids} for a in body.answers],
        county=body.county,
        town=body.town,
        phone=body.phone,
        attribution=body.attribution.model_dump(exclude_none=True) if body.attribution else None,
    )
