"""Authentication routes: register, login, current user."""

from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from app.services.auth_service import AuthService
from app.utils.helpers import api_error, api_success, login_required_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    user, err, status = AuthService.register(
        full_name=data.get("full_name"),
        email=data.get("email"),
        password=data.get("password"),
    )
    if err:
        return api_error(err, status)
    return api_success(
        "Registration successful",
        {"user": user.to_public_dict()},
        status,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    user, err, status = AuthService.authenticate(
        email=data.get("email"),
        password=data.get("password"),
    )
    if err:
        return api_error(err, status)

    access_token = create_access_token(identity=str(user.id))
    return api_success(
        "Login successful",
        {
            "access_token": access_token,
            "user": user.to_public_dict(),
        },
    )


@auth_bp.route("/me", methods=["GET"])
@login_required_user
def me(user):
    return api_success("Current user retrieved", {"user": user.to_profile_dict()})
