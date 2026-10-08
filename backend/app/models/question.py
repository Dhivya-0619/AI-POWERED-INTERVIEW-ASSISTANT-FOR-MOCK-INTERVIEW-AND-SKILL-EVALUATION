"""Question model for generated interview questions."""

from datetime import datetime, timezone

from app.extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(
        db.Integer, db.ForeignKey("interviews.id"), nullable=False, index=True
    )
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    expected_answer = db.Column(db.Text, nullable=True)
    question_order = db.Column(db.Integer, nullable=False)
    generation_source = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    interview = db.relationship("Interview", back_populates="questions")

    def to_dict(self, include_expected: bool = False) -> dict:
        data = {
            "id": self.id,
            "interview_id": self.interview_id,
            "question_order": self.question_order,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "difficulty": self.difficulty,
            "generation_source": self.generation_source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_expected:
            data["expected_answer"] = self.expected_answer
        return data

    def __repr__(self) -> str:
        return f"<Question {self.id} interview={self.interview_id}>"
