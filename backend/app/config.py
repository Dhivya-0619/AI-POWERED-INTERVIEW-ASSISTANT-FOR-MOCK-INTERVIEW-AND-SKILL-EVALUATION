"""Application configuration loaded from environment variables."""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    """Base configuration for the Interview Assistant backend."""

    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-development-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'interview_assistant.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))
    ALLOWED_EXTENSIONS = {"pdf", "docx"}

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Optional LLM settings — empty means rule-based fallback only
    AI_PROVIDER = os.getenv("AI_PROVIDER", "").strip()
    AI_API_KEY = os.getenv("AI_API_KEY", "").strip()
    AI_MODEL = os.getenv("AI_MODEL", "").strip()

    # Password policy
    MIN_PASSWORD_LENGTH = 8


class TestConfig(Config):
    """Isolated SQLite database for pytest."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    UPLOAD_FOLDER = str(BASE_DIR / "uploads" / "test")
    WTF_CSRF_ENABLED = False
