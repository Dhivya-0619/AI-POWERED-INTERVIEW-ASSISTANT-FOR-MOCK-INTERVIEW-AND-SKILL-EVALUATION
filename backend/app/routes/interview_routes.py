"""Interview configuration routes (Phase 1 — no mock execution)."""

import json

from flask import Blueprint, request

from app.extensions import db
from app.models.interview import DEFAULT_STATUS, Interview
from app.models.resume import Resume
from app.utils.helpers import api_error, api_success, login_required_user
from app.utils.validators import (
    validate_difficulty,
    validate_duration,
    validate_interview_type,
    validate_number_of_questions,
    validate_required_string,
    validate_skills_list,
)

interview_bp = Blueprint("interviews", __name__)


@interview_bp.route("/", methods=["POST"])
@login_required_user
def create_interview(user):
    data = request.get_json(silent=True) or {}

    ok, err = validate_interview_type(data.get("interview_type"))
    if not ok:
        return api_error(err, 422)

    ok, err = validate_difficulty(data.get("difficulty"))
    if not ok:
        return api_error(err, 422)

    ok, err = validate_required_string(data.get("job_role"), "Job role", 120)
    if not ok:
        return api_error(err, 422)

    ok, skills = validate_skills_list(data.get("skills"))
    if not ok:
        return api_error(skills, 422)

    ok, num_q = validate_number_of_questions(data.get("number_of_questions"))
    if not ok:
        return api_error(num_q, 422)

    ok, duration = validate_duration(data.get("duration_minutes"))
    if not ok:
        return api_error(duration, 422)

    resume_id = data.get("resume_id")
    if resume_id is not None:
        try:
            resume_id = int(resume_id)
        except (TypeError, ValueError):
            return api_error("resume_id must be an integer", 422)
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        if resume is None:
            any_resume = db.session.get(Resume, resume_id)
            if any_resume is not None:
                return api_error("You do not have permission to use this resume", 403)
            return api_error("Resume not found", 404)

    use_resume = bool(data.get("use_resume_questions", False))
    if use_resume and resume_id is None:
        return api_error(
            "resume_id is required when use_resume_questions is true", 422
        )

    interview = Interview(
        user_id=user.id,
        resume_id=resume_id,
        interview_type=data["interview_type"],
        difficulty=data["difficulty"],
        job_role=data["job_role"].strip(),
        selected_skills=json.dumps(skills),
        number_of_questions=num_q,
        duration_minutes=duration,
        use_resume_questions=use_resume,
        status=DEFAULT_STATUS,
    )
    db.session.add(interview)
    db.session.commit()

    return api_success(
        "Interview created successfully",
        {"interview": interview.to_dict()},
        201,
    )


@interview_bp.route("/<int:interview_id>", methods=["GET"])
@login_required_user
def get_interview(user, interview_id):
    interview = Interview.query.filter_by(id=interview_id, user_id=user.id).first()
    if interview is None:
        any_i = db.session.get(Interview, interview_id)
        if any_i is not None and any_i.user_id != user.id:
            return api_error("You do not have permission to access this interview", 403)
        return api_error("Interview not found", 404)
    return api_success("Interview retrieved", {"interview": interview.to_dict()})


@interview_bp.route("/", methods=["GET"])
@login_required_user
def list_interviews(user):
    query = Interview.query.filter_by(user_id=user.id)

    interview_type = request.args.get("interview_type")
    if interview_type:
        query = query.filter_by(interview_type=interview_type)

    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)

    # Simple beginner-friendly pagination
    try:
        page = max(int(request.args.get("page", 1)), 1)
    except ValueError:
        page = 1
    try:
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    except ValueError:
        per_page = 20

    pagination = query.order_by(Interview.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return api_success(
        "Interviews retrieved",
        {
            "interviews": [i.to_dict() for i in pagination.items],
            "count": pagination.total,
            "page": page,
            "per_page": per_page,
            "pages": pagination.pages,
        },
    )
