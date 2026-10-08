"""Interview configuration model (Phase 1 — no execution yet)."""

from datetime import datetime, timezone
import json

from app.extensions import db


def utc_now():
    return datetime.now(timezone.utc)


VALID_INTERVIEW_TYPES = {"Technical", "HR", "Behavioral", "Mixed"}
VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}
DEFAULT_STATUS = "Not Started"


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=True)
    interview_type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    job_role = db.Column(db.String(120), nullable=False)
    selected_skills = db.Column(db.Text, nullable=False)  # JSON list
    number_of_questions = db.Column(db.Integer, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    use_resume_questions = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.String(50), default=DEFAULT_STATUS, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    user = db.relationship("User", back_populates="interviews")
    resume = db.relationship("Resume", back_populates="interviews")
    questions = db.relationship(
        "Question",
        back_populates="interview",
        cascade="all, delete-orphan",
        order_by="Question.question_order",
        lazy=True,
    )

    def get_skills(self) -> list:
        if not self.selected_skills:
            return []
        try:
            data = json.loads(self.selected_skills)
            return data if isinstance(data, list) else []
        except (json.JSONDecodeError, TypeError):
            return [s.strip() for s in self.selected_skills.split(",") if s.strip()]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "resume_id": self.resume_id,
            "interview_type": self.interview_type,
            "difficulty": self.difficulty,
            "job_role": self.job_role,
            "skills": self.get_skills(),
            "number_of_questions": self.number_of_questions,
            "duration_minutes": self.duration_minutes,
            "use_resume_questions": self.use_resume_questions,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Interview {self.id} type={self.interview_type}>"
