"""Shared helper utilities for API responses and file handling."""

import os
import uuid
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.user import User


def api_success(message: str = "OK", data: dict = None, status: int = 200):
    body = {"success": True, "message": message}
    if data:
        body.update(data)
    return jsonify(body), status


def api_error(message: str, status: int = 400):
    return jsonify({"success": False, "message": message}), status


def get_current_user():
    """Load the authenticated User from the JWT identity (user id)."""
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None
    return db.session.get(User, user_id)


def login_required_user(fn):
    """Decorator that injects the current User or returns 401."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return api_error("Unauthorized. Please log in.", 401)
        return fn(user, *args, **kwargs)

    return wrapper


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in allowed_extensions


def get_file_extension(filename: str) -> str:
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()


def generate_stored_filename(original_filename: str) -> str:
    """Create a safe unique storage name — never use the original as the path."""
    safe = secure_filename(original_filename) or "upload"
    ext = get_file_extension(safe)
    unique = uuid.uuid4().hex
    if ext:
        return f"{unique}.{ext}"
    return unique


def ensure_upload_folder(folder: str) -> None:
    os.makedirs(folder, exist_ok=True)


def safe_remove_file(filepath: str) -> None:
    """Delete a file if it exists; ignore missing files."""
    try:
        if filepath and os.path.isfile(filepath):
            os.remove(filepath)
    except OSError:
        pass


def skills_to_storage(skills) -> str:
    """Store skills as a comma-separated string."""
    if skills is None:
        return None
    if isinstance(skills, list):
        return ", ".join(str(s).strip() for s in skills if str(s).strip())
    return str(skills).strip()
