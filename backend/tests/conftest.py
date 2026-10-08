"""Pytest fixtures — uses an in-memory SQLite database."""

import io
import os
import sys

import pytest

# Ensure backend root is on sys.path
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from app import create_app
from app.config import TestConfig
from app.extensions import db


@pytest.fixture
def app():
    application = create_app(TestConfig)
    os.makedirs(application.config["UPLOAD_FOLDER"], exist_ok=True)

    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register + login a default user; return Authorization headers."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "StrongPassword123",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "StrongPassword123"},
    )
    token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def make_pdf_bytes(text: str = "John Doe\nSkills: Python Java Flask SQL Git\nEducation: B.Tech CSE\nProjects: Smart Scholarship System") -> bytes:
    """Create a minimal PDF with extractable text using PyMuPDF."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.fixture
def sample_pdf():
    return (io.BytesIO(make_pdf_bytes()), "resume.pdf")
