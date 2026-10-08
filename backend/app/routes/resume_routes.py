"""Resume upload, analysis, retrieval, and deletion routes."""

from flask import Blueprint, request

from app.services.resume_service import ResumeService
from app.utils.helpers import api_error, api_success, login_required_user

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/upload", methods=["POST"])
@login_required_user
def upload_resume(user):
    if "file" not in request.files:
        return api_error("No file provided. Use multipart field name 'file'.", 400)

    file = request.files["file"]
    resume, err, status = ResumeService.upload_resume(user, file)
    if err:
        return api_error(err, status)

    return api_success(
        "Resume uploaded successfully",
        {
            "resume": {
                "id": resume.id,
                "filename": resume.original_filename,
                "status": "uploaded",
            }
        },
        status,
    )


@resume_bp.route("/analyze/<int:resume_id>", methods=["POST"])
@login_required_user
def analyze_resume(user, resume_id):
    analysis, err, status = ResumeService.analyze_resume(user, resume_id)
    if err:
        return api_error(err, status)
    return api_success("Resume analyzed successfully", {"analysis": analysis})


@resume_bp.route("/<int:resume_id>", methods=["GET"])
@login_required_user
def get_resume(user, resume_id):
    resume, err, status = ResumeService.get_resume_for_user(user, resume_id)
    if err:
        return api_error(err, status)
    return api_success("Resume retrieved", {"resume": resume.to_dict(include_text=False)})


@resume_bp.route("/", methods=["GET"])
@login_required_user
def list_resumes(user):
    resumes = ResumeService.list_resumes(user)
    return api_success("Resumes retrieved", {"resumes": resumes, "count": len(resumes)})


@resume_bp.route("/<int:resume_id>", methods=["DELETE"])
@login_required_user
def delete_resume(user, resume_id):
    ok, err, status = ResumeService.delete_resume(user, resume_id)
    if not ok:
        return api_error(err, status)
    return api_success("Resume deleted successfully")
