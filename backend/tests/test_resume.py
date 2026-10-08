"""Resume upload and analysis tests."""

import io

from tests.conftest import make_pdf_bytes


def _upload(client, headers, filename="resume.pdf", content=None, content_type=None):
    if content is None:
        content = make_pdf_bytes()
    if content_type is None:
        content_type = "application/pdf"
    data = {"file": (io.BytesIO(content), filename)}
    return client.post(
        "/api/resume/upload",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )


def test_upload_pdf(client, auth_headers):
    resp = _upload(client, auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["success"] is True
    assert data["resume"]["status"] == "uploaded"
    assert "id" in data["resume"]


def test_invalid_file_type(client, auth_headers):
    resp = _upload(
        client,
        auth_headers,
        filename="notes.txt",
        content=b"just text",
        content_type="text/plain",
    )
    assert resp.status_code == 415
    assert resp.get_json()["success"] is False


def test_resume_retrieval_and_ownership(client, auth_headers):
    upload = _upload(client, auth_headers)
    resume_id = upload.get_json()["resume"]["id"]

    get_resp = client.get(f"/api/resume/{resume_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.get_json()["resume"]["id"] == resume_id

    # Second user cannot access
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Other",
            "email": "other@example.com",
            "password": "StrongPassword123",
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "other@example.com", "password": "StrongPassword123"},
    )
    other_headers = {"Authorization": f"Bearer {login.get_json()['access_token']}"}
    forbidden = client.get(f"/api/resume/{resume_id}", headers=other_headers)
    assert forbidden.status_code == 403


def test_resume_deletion(client, auth_headers):
    upload = _upload(client, auth_headers)
    resume_id = upload.get_json()["resume"]["id"]
    delete = client.delete(f"/api/resume/{resume_id}", headers=auth_headers)
    assert delete.status_code == 200
    missing = client.get(f"/api/resume/{resume_id}", headers=auth_headers)
    assert missing.status_code == 404


def test_basic_skill_extraction(client, auth_headers):
    upload = _upload(client, auth_headers)
    resume_id = upload.get_json()["resume"]["id"]
    analyze = client.post(f"/api/resume/analyze/{resume_id}", headers=auth_headers)
    assert analyze.status_code == 200
    data = analyze.get_json()
    assert data["analysis"]["analysis_mode"] == "rule_based_demo"
    skills = data["analysis"]["skills"]
    assert "Python" in skills
    assert "Java" in skills
    assert "Flask" in skills


def test_list_resumes(client, auth_headers):
    _upload(client, auth_headers)
    resp = client.get("/api/resume/", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["count"] >= 1
