"""Flask application factory."""

import os

from flask import Flask, jsonify

from app.config import Config
from app.extensions import cors, db, jwt


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    # CORS — allow local Vite ports (3000/3001/5173) during development
    cors_origins = [
        app.config.get("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    # De-duplicate while preserving order
    cors_origins = list(dict.fromkeys([o for o in cors_origins if o]))

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Blueprints
    from app.routes import auth_bp, interview_bp, profile_bp, question_bp, resume_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(interview_bp, url_prefix="/api/interviews")
    app.register_blueprint(question_bp, url_prefix="/api/interviews")

    # Health check
    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "message": "Interview Assistant API is running"})

    # Error handlers — never expose stack traces
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad request"}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"success": False, "message": "Unauthorized. Please log in."}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"success": False, "message": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({"success": False, "message": "Conflict"}), 409

    @app.errorhandler(413)
    def too_large(e):
        return jsonify(
            {
                "success": False,
                "message": "Uploaded file is too large. Maximum size is 5 MB.",
            }
        ), 413

    @app.errorhandler(415)
    def unsupported_media(e):
        return jsonify(
            {"success": False, "message": "Unsupported media type"}
        ), 415

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"success": False, "message": "Validation error"}), 422

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify(
            {"success": False, "message": "Internal server error"}
        ), 500

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify(
            {"success": False, "message": "Missing or invalid authorization token"}
        ), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify(
            {"success": False, "message": "Invalid authorization token"}
        ), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify(
            {"success": False, "message": "Authorization token has expired"}
        ), 401

    # Create tables automatically for development (SQLite)
    with app.app_context():
        # Import models so metadata is registered
        from app import models  # noqa: F401

        db.create_all()

    return app
