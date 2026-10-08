"""Authentication and registration service."""

from app.extensions import db
from app.models.user import User
from app.utils.validators import (
    is_valid_email_format,
    normalize_email,
    validate_password,
    validate_required_string,
)
class AuthService:
    @staticmethod
    def register(full_name: str, email: str, password: str):
        """
        Register a new user.
        Returns (user, error_message, status_code).
        """
        ok, err = validate_required_string(full_name, "Full name", max_length=120)
        if not ok:
            return None, err, 422

        ok, err = validate_required_string(email, "Email", max_length=255)
        if not ok:
            return None, err, 422

        email = normalize_email(email)
        if not is_valid_email_format(email):
            return None, "Email format is invalid", 422

        ok, err = validate_password(password)
        if not ok:
            return None, err, 422

        existing = User.query.filter_by(email=email).first()
        if existing:
            return None, "An account with this email already exists", 409

        user = User(full_name=full_name.strip(), email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user, None, 201
    @staticmethod
    def authenticate(email: str, password: str):
        """
        Verify credentials.
        Returns (user, error_message, status_code).
        """
        if not email or not password:
            return None, "Email and password are required", 422

        email = normalize_email(email)
        user = User.query.filter_by(email=email).first()
        if user is None or not user.check_password(password):
            return None, "Invalid email or password", 401
        return user, None, 200
    @staticmethod
    def update_profile(user: User, data: dict):
        """Update allowed profile fields. Returns (user, error, status)."""
        if "full_name" in data:
            ok, err = validate_required_string(data["full_name"], "Full name", 120)
            if not ok:
                return None, err, 422
            user.full_name = data["full_name"].strip()

        if "education" in data:
            education = data["education"]
            if education is not None and not isinstance(education, str):
                return None, "Education must be a string", 422
            user.education = education.strip() if education else None

        if "preferred_job_role" in data:
            role = data["preferred_job_role"]
            if role is not None and not isinstance(role, str):
                return None, "Preferred job role must be a string", 422
            user.preferred_job_role = role.strip() if role else None

        if "skills" in data:
            skills = data["skills"]
            if isinstance(skills, list):
                user.skills = ", ".join(
                    str(s).strip() for s in skills if str(s).strip()
                ) or None
            elif isinstance(skills, str):
                user.skills = skills.strip() or None
            elif skills is None:
                user.skills = None
            else:
                return None, "Skills must be a list or string", 422

        # Email cannot be changed via this endpoint for simplicity/security
        db.session.commit()
        return user, None, 200
    @staticmethod
    def change_password(user: User, current_password: str, new_password: str):
        if not current_password or not new_password:
            return False, "Current password and new password are required", 422

        if not user.check_password(current_password):
            return False, "Current password is incorrect", 401

        ok, err = validate_password(new_password)
        if not ok:
            return False, err, 422

        if current_password == new_password:
            return False, "New password must be different from the current password", 422

        user.set_password(new_password)
        db.session.commit()
        return True, None, 200
