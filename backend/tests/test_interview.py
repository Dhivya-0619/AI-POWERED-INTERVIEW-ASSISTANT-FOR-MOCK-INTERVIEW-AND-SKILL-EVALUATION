"""Interview configuration tests."""

import io

from tests.conftest import make_pdf_bytes


def _create_resume(client, headers):
    data = {"file": (io.BytesIO(make_pdf_bytes()), "resume.pdf")}
    resp = client.post(
        "/api/resume/upload",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )
    return resp.get_json()["resume"]["id"]


def _valid_payload(resume_id=None):
    payload = {
        "interview_type": "Technical",
        "difficulty": "Intermediate",
        "job_role": "Java Developer",
        "skills": ["Java", "OOP", "DBMS"],
        "number_of_questions": 5,
        "duration_minutes": 30,
        "use_resume_questions": False,
    }
    if resume_id is not None:
        payload["resume_id"] = resume_id
        payload["use_resume_questions"] = True
    return payload


def test_create_interview(client, auth_headers):
    resume_id = _create_resume(client, auth_headers)
    resp = client.post(
        "/api/interviews/",
        headers=auth_headers,
        json=_valid_payload(resume_id),
    )
    assert resp.status_code == 201
    interview = resp.get_json()["interview"]
    assert interview["interview_type"] == "Technical"
    assert interview["status"] == "Not Started"
    assert interview["skills"] == ["Java", "OOP", "DBMS"]


def test_invalid_interview_type(client, auth_headers):
    resp = client.post(
        "/api/interviews/",
        headers=auth_headers,
        json={**_valid_payload(), "interview_type": "Coding Round"},
    )
    assert resp.status_code == 422


def test_invalid_difficulty(client, auth_headers):
    resp = client.post(
        "/api/interviews/",
        headers=auth_headers,
        json={**_valid_payload(), "difficulty": "Expert"},
    )
    assert resp.status_code == 422


def test_resume_ownership_on_create(client, auth_headers):
    resume_id = _create_resume(client, auth_headers)

    client.post(
        "/api/auth/register",
        json={
            "full_name": "Other",
            "email": "other2@example.com",
            "password": "StrongPassword123",
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "other2@example.com", "password": "StrongPassword123"},
    )
    other = {"Authorization": f"Bearer {login.get_json()['access_token']}"}

    resp = client.post(
        "/api/interviews/",
        headers=other,
        json=_valid_payload(resume_id),
    )
    assert resp.status_code == 403


def test_get_interview(client, auth_headers):
    create = client.post(
        "/api/interviews/", headers=auth_headers, json=_valid_payload()
    )
    interview_id = create.get_json()["interview"]["id"]
    resp = client.get(f"/api/interviews/{interview_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["interview"]["id"] == interview_id


def test_list_interviews_filter(client, auth_headers):
    client.post("/api/interviews/", headers=auth_headers, json=_valid_payload())
    client.post(
        "/api/interviews/",
        headers=auth_headers,
        json={**_valid_payload(), "interview_type": "HR"},
    )
    resp = client.get(
        "/api/interviews/?interview_type=Technical", headers=auth_headers
    )
    assert resp.status_code == 200
    for item in resp.get_json()["interviews"]:
        assert item["interview_type"] == "Technical"
