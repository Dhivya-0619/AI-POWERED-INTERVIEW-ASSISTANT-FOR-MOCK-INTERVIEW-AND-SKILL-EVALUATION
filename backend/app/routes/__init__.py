"""Route blueprints package."""

from app.routes.auth_routes import auth_bp
from app.routes.profile_routes import profile_bp
from app.routes.resume_routes import resume_bp
from app.routes.interview_routes import interview_bp
from app.routes.question_routes import question_bp

__all__ = ["auth_bp", "profile_bp", "resume_bp", "interview_bp", "question_bp"]
