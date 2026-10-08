"""Authentication API tests."""


def test_registration(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "full_name": "Alice",
            "email": "alice@example.com",
            "password": "StrongPassword123",
        },
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["success"] is True
    assert data["user"]["email"] == "alice@example.com"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_duplicate_email(client):
    payload = {
        "full_name": "Bob",
        "email": "bob@example.com",
        "password": "StrongPassword123",
    }
    assert client.post("/api/auth/register", json=payload).status_code == 201
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409
    assert resp.get_json()["success"] is False


def test_login(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Carol",
            "email": "carol@example.com",
            "password": "StrongPassword123",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "StrongPassword123"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "carol@example.com"


def test_invalid_login(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Dave",
            "email": "dave@example.com",
            "password": "StrongPassword123",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "WrongPassword"},
    )
    assert resp.status_code == 401
    assert resp.get_json()["success"] is False


def test_current_user(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["user"]["email"] == "test@example.com"
    assert "password_hash" not in data["user"]


def test_me_unauthorized(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
