"""Profile API tests."""


def test_get_profile(client, auth_headers):
    resp = client.get("/api/profile/", headers=auth_headers)
    assert resp.status_code == 200
    profile = resp.get_json()["profile"]
    assert profile["email"] == "test@example.com"
    assert "full_name" in profile
    assert "skills" in profile


def test_update_profile(client, auth_headers):
    resp = client.put(
        "/api/profile/",
        headers=auth_headers,
        json={
            "full_name": "Updated Name",
            "education": "B.Tech CSE",
            "preferred_job_role": "Java Developer",
            "skills": ["Java", "Spring Boot"],
        },
    )
    assert resp.status_code == 200
    profile = resp.get_json()["profile"]
    assert profile["full_name"] == "Updated Name"
    assert profile["education"] == "B.Tech CSE"
    assert profile["preferred_job_role"] == "Java Developer"
    assert "Java" in profile["skills"]


def test_change_password(client, auth_headers):
    resp = client.post(
        "/api/profile/change-password",
        headers=auth_headers,
        json={
            "current_password": "StrongPassword123",
            "new_password": "NewPassword123",
        },
    )
    assert resp.status_code == 200

    # Old password fails
    bad = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "StrongPassword123"},
    )
    assert bad.status_code == 401

    # New password works
    good = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "NewPassword123"},
    )
    assert good.status_code == 200


def test_change_password_wrong_current(client, auth_headers):
    resp = client.post(
        "/api/profile/change-password",
        headers=auth_headers,
        json={
            "current_password": "WrongOldPassword",
            "new_password": "NewPassword123",
        },
    )
    assert resp.status_code == 401
