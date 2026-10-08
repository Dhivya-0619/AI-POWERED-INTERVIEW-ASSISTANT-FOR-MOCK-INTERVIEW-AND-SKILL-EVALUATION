"""Quick end-to-end Phase 1 API smoke test."""
import json
import urllib.error
import urllib.request

import fitz

BASE = "http://127.0.0.1:5000/api"
EMAIL = "e2e2_test@example.com"
PASSWORD = "StrongPassword123"


def req(method, path, data=None, token=None, file_bytes=None, filename="resume.pdf"):
    url = BASE + path
    headers = {}
    body = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if file_bytes is not None:
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        parts = [
            f"--{boundary}".encode(),
            f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode(),
            b"Content-Type: application/pdf",
            b"",
            file_bytes,
            f"--{boundary}--".encode(),
            b"",
        ]
        body = b"\r\n".join(parts)
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    elif data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode())


def main():
    st, reg = req(
        "POST",
        "/auth/register",
        {"full_name": "E2E", "email": EMAIL, "password": PASSWORD},
    )
    print("register", st, reg.get("message"))

    st, login = req(
        "POST", "/auth/login", {"email": EMAIL, "password": PASSWORD}
    )
    assert st == 200, login
    token = login["access_token"]
    print("login ok")

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (72, 72),
        "Java Python Flask SQL Spring Boot\nEducation B.Tech CSE\nProjects Smart Scholarship System",
    )
    pdf = doc.tobytes()
    doc.close()

    st, up = req("POST", "/resume/upload", token=token, file_bytes=pdf)
    print("upload", st, up.get("message"), up.get("resume"))
    assert st == 201, up
    rid = up["resume"]["id"]

    st, an = req("POST", f"/resume/analyze/{rid}", token=token)
    print("analyze", st, an["analysis"]["analysis_mode"], an["analysis"]["skills"])
    assert st == 200, an

    st, iv = req(
        "POST",
        "/interviews/",
        {
            "interview_type": "Technical",
            "difficulty": "Intermediate",
            "job_role": "Java Developer",
            "skills": ["Java", "SQL"],
            "number_of_questions": 3,
            "duration_minutes": 20,
            "resume_id": rid,
            "use_resume_questions": True,
        },
        token=token,
    )
    print("interview", st, iv.get("interview", {}).get("id"))
    assert st == 201, iv
    iid = iv["interview"]["id"]

    st, qs = req("POST", f"/interviews/{iid}/generate-questions", token=token)
    print("questions", st, qs.get("generation_source"), len(qs.get("questions", [])))
    assert st == 200, qs
    for q in qs["questions"]:
        print(" ", q["question_order"], q["question_text"][:80])
    print("E2E_OK")


if __name__ == "__main__":
    main()
