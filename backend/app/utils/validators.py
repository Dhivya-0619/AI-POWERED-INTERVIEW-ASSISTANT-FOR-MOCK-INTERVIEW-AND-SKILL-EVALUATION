"""Input validation helpers."""

import re
from email_validator import EmailNotValidError, validate_email


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

MIN_PASSWORD_LENGTH = 8
MIN_QUESTIONS = 1
MAX_QUESTIONS = 30
MIN_DURATION = 5
MAX_DURATION = 180


def normalize_email(email: str) -> str:
    """Normalize email to lowercase trimmed form."""
    return (email or "").strip().lower()


def is_valid_email_format(email: str) -> bool:
    if not email or not EMAIL_PATTERN.match(email.strip()):
        return False
    try:
        validate_email(email.strip(), check_deliverability=False)
        return True
    except EmailNotValidError:
        return False


def validate_password(password: str, min_length: int = MIN_PASSWORD_LENGTH):
    """Return (ok, error_message)."""
    if not password:
        return False, "Password is required"
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters long"
    return True, None


def validate_required_string(value, field_name: str, max_length: int = None):
    if value is None or (isinstance(value, str) and not value.strip()):
        return False, f"{field_name} is required"
    if not isinstance(value, str):
        return False, f"{field_name} must be a string"
    if max_length and len(value.strip()) > max_length:
        return False, f"{field_name} must be at most {max_length} characters"
    return True, None


def validate_skills_list(skills):
    if skills is None:
        return False, "Skills are required"
    if not isinstance(skills, list):
        return False, "Skills must be a list"
    cleaned = [str(s).strip() for s in skills if str(s).strip()]
    if not cleaned:
        return False, "At least one skill is required"
    return True, cleaned


def validate_interview_type(value: str):
    from app.models.interview import VALID_INTERVIEW_TYPES

    if not value or value not in VALID_INTERVIEW_TYPES:
        allowed = ", ".join(sorted(VALID_INTERVIEW_TYPES))
        return False, f"Interview type must be one of: {allowed}"
    return True, None


def validate_difficulty(value: str):
    from app.models.interview import VALID_DIFFICULTIES

    if not value or value not in VALID_DIFFICULTIES:
        allowed = ", ".join(sorted(VALID_DIFFICULTIES))
        return False, f"Difficulty must be one of: {allowed}"
    return True, None


def validate_number_of_questions(value):
    try:
        n = int(value)
    except (TypeError, ValueError):
        return False, "Number of questions must be an integer"
    if n < MIN_QUESTIONS or n > MAX_QUESTIONS:
        return False, f"Number of questions must be between {MIN_QUESTIONS} and {MAX_QUESTIONS}"
    return True, n


def validate_duration(value):
    try:
        n = int(value)
    except (TypeError, ValueError):
        return False, "Duration must be an integer (minutes)"
    if n < MIN_DURATION or n > MAX_DURATION:
        return False, f"Duration must be between {MIN_DURATION} and {MAX_DURATION} minutes"
    return True, n
