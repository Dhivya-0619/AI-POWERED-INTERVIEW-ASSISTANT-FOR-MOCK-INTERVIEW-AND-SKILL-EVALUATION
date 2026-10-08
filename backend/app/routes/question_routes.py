"""Question generation and retrieval routes."""

from flask import Blueprint

from app.services.question_service import QuestionService
from app.utils.helpers import api_error, api_success, login_required_user

question_bp = Blueprint("questions", __name__)


@question_bp.route("/<int:interview_id>/generate-questions", methods=["POST"])
@login_required_user
def generate_questions(user, interview_id):
    result, err, status = QuestionService.generate_for_interview(user, interview_id)
    if err:
        return api_error(err, status)
    return api_success(
        "Questions generated successfully",
        {
            "generation_source": result["generation_source"],
            "questions": result["questions"],
        },
    )


@question_bp.route("/<int:interview_id>/questions", methods=["GET"])
@login_required_user
def get_questions(user, interview_id):
    questions, err, status = QuestionService.list_questions(user, interview_id)
    if err:
        return api_error(err, status)
    return api_success(
        "Questions retrieved",
        {"questions": questions, "count": len(questions)},
    )
