"""User model for authentication and profile management."""

from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    education = db.Column(db.Text, nullable=True)
    preferred_job_role = db.Column(db.String(120), nullable=True)
    skills = db.Column(db.Text, nullable=True)  # comma-separated or JSON string
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    resumes = db.relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan", lazy=True
    )
    interviews = db.relationship(
        "Interview", back_populates="user", cascade="all, delete-orphan", lazy=True
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_public_dict(self) -> dict:
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
        }

    def to_profile_dict(self) -> dict:
        skills_list = []
        if self.skills:
            skills_list = [s.strip() for s in self.skills.split(",") if s.strip()]
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "education": self.education,
            "preferred_job_role": self.preferred_job_role,
            "skills": skills_list,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"
