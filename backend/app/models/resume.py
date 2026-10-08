"""Resume model for uploaded documents and analysis results."""

from datetime import datetime, timezone
import json

from app.extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=True)
    extracted_skills = db.Column(db.Text, nullable=True)  # JSON list
    education_details = db.Column(db.Text, nullable=True)
    experience_details = db.Column(db.Text, nullable=True)
    projects = db.Column(db.Text, nullable=True)
    improvement_suggestions = db.Column(db.Text, nullable=True)
    analysis_mode = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    user = db.relationship("User", back_populates="resumes")
    interviews = db.relationship("Interview", back_populates="resume", lazy=True)

    def _parse_json_list(self, value):
        if not value:
            return []
        try:
            data = json.loads(value)
            return data if isinstance(data, list) else [data]
        except (json.JSONDecodeError, TypeError):
            return [s.strip() for s in value.split(",") if s.strip()]

    def to_dict(self, include_text: bool = False) -> dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "original_filename": self.original_filename,
            "filename": self.original_filename,
            "extracted_skills": self._parse_json_list(self.extracted_skills),
            "education_details": self.education_details,
            "experience_details": self.experience_details,
            "projects": self._parse_json_list(self.projects),
            "improvement_suggestions": self._parse_json_list(
                self.improvement_suggestions
            ),
            "analysis_mode": self.analysis_mode,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_text:
            data["extracted_text"] = self.extracted_text
        return data

    def __repr__(self) -> str:
        return f"<Resume {self.id} user={self.user_id}>"
