"""Profile routes: get/update profile and change password."""

from flask import Blueprint, request

from app.services.auth_service import AuthService
from app.utils.helpers import api_error, api_success, login_required_user

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/", methods=["GET"])
@login_required_user
def get_profile(user):
    return api_success("Profile retrieved", {"profile": user.to_profile_dict()})


@profile_bp.route("/", methods=["PUT"])
@login_required_user
def update_profile(user):
    data = request.get_json(silent=True) or {}
    # Disallow email changes via profile update
    data.pop("email", None)
    data.pop("password", None)
    data.pop("password_hash", None)

    updated, err, status = AuthService.update_profile(user, data)
    if err:
        return api_error(err, status)
    return api_success("Profile updated successfully", {"profile": updated.to_profile_dict()})


@profile_bp.route("/change-password", methods=["POST"])
@login_required_user
def change_password(user):
    data = request.get_json(silent=True) or {}
    ok, err, status = AuthService.change_password(
        user,
        current_password=data.get("current_password"),
        new_password=data.get("new_password"),
    )
    if not ok:
        return api_error(err, status)
    return api_success("Password changed successfully")
