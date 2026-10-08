"""Question generation tests."""

import io

from tests.conftest import make_pdf_bytes


def _setup_interview(client, headers, num_questions=5, use_resume=True):
    data = {"file": (io.BytesIO(make_pdf_bytes()), "resume.pdf")}
    upload = client.post(
        "/api/resume/upload",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )
    resume_id = upload.get_json()["resume"]["id"]
    client.post(f"/api/resume/analyze/{resume_id}", headers=headers)

    payload = {
        "interview_type": "Technical",
        "difficulty": "Intermediate",
        "job_role": "Java Developer",
        "skills": ["Java", "OOP", "DBMS"],
        "number_of_questions": num_questions,
        "duration_minutes": 30,
        "resume_id": resume_id,
        "use_resume_questions": use_resume,
    }
    create = client.post("/api/interviews/", headers=headers, json=payload)
    return create.get_json()["interview"]["id"]


def test_generate_questions(client, auth_headers):
    interview_id = _setup_interview(client, auth_headers, num_questions=5)
    resp = client.post(
        f"/api/interviews/{interview_id}/generate-questions",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert data["generation_source"] == "fallback_rule_based"
    assert len(data["questions"]) == 5
    assert data["questions"][0]["question_order"] == 1


def test_retrieve_questions(client, auth_headers):
    interview_id = _setup_interview(client, auth_headers, num_questions=3)
    client.post(
        f"/api/interviews/{interview_id}/generate-questions",
        headers=auth_headers,
    )
    resp = client.get(
        f"/api/interviews/{interview_id}/questions",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.get_json()["count"] == 3


def test_duplicate_prevention(client, auth_headers):
    interview_id = _setup_interview(client, auth_headers, num_questions=8)
    resp = client.post(
        f"/api/interviews/{interview_id}/generate-questions",
        headers=auth_headers,
    )
    texts = [q["question_text"].lower() for q in resp.get_json()["questions"]]
    assert len(texts) == len(set(texts))


def test_fallback_question_generation(client, auth_headers, app):
    """With AI unset, generation_source must be fallback_rule_based."""
    assert not app.config.get("AI_PROVIDER")
    interview_id = _setup_interview(client, auth_headers, num_questions=4)
    resp = client.post(
        f"/api/interviews/{interview_id}/generate-questions",
        headers=auth_headers,
    )
    assert resp.get_json()["generation_source"] == "fallback_rule_based"
    for q in resp.get_json()["questions"]:
        assert q["question_text"]
        assert q["difficulty"] == "Intermediate"
