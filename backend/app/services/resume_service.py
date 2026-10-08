"""Resume upload, text extraction, and rule-based analysis."""

from __future__ import annotations

import json
import os
import re
from typing import Optional, Tuple

from flask import current_app
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.resume import Resume
from app.models.user import User
from app.services.ai_service import AIService
from app.utils.helpers import (
    allowed_file,
    ensure_upload_folder,
    generate_stored_filename,
    get_file_extension,
    safe_remove_file,
)

# Configurable skill dictionary for rule-based extraction (keyword matching)
SKILL_DICTIONARY = {
    "programming_languages": [
        "Java",
        "Python",
        "C++",
        "C",
        "JavaScript",
        "TypeScript",
        "Go",
        "Kotlin",
        "Swift",
        "Ruby",
        "PHP",
        "R",
        "Scala",
    ],
    "frameworks": [
        "React",
        "Angular",
        "Vue",
        "Node.js",
        "Spring Boot",
        "Flask",
        "Django",
        "Express",
        "FastAPI",
        "Next.js",
        "Laravel",
        ".NET",
    ],
    "databases": [
        "SQL",
        "MySQL",
        "PostgreSQL",
        "MongoDB",
        "Oracle",
        "SQLite",
        "Redis",
        "Cassandra",
        "DynamoDB",
    ],
    "cloud": [
        "AWS",
        "Azure",
        "Google Cloud",
        "GCP",
        "Heroku",
        "Firebase",
    ],
    "tools": [
        "Docker",
        "Kubernetes",
        "Git",
        "GitHub",
        "GitLab",
        "Jenkins",
        "Jira",
        "Linux",
        "Postman",
        "HTML",
        "CSS",
    ],
    "ai_ml": [
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "NLP",
        "Computer Vision",
        "Scikit-learn",
        "Pandas",
        "NumPy",
    ],
}

# Flatten for searching — longer phrases first to avoid partial double-counts
ALL_SKILLS = sorted(
    {s for group in SKILL_DICTIONARY.values() for s in group},
    key=len,
    reverse=True,
)


class ResumeService:
    @staticmethod
    def upload_resume(user: User, file: FileStorage) -> Tuple[Optional[Resume], Optional[str], int]:
        if file is None or not getattr(file, "filename", None):
            return None, "No file provided. Use multipart field name 'file'.", 400

        original_name = file.filename
        allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "docx"})

        if not allowed_file(original_name, allowed):
            return None, "Unsupported media type. Only PDF and DOCX files are allowed.", 415

        # Size is also enforced by Flask MAX_CONTENT_LENGTH (413)
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        ensure_upload_folder(upload_folder)

        safe_original = secure_filename(original_name) or "resume"
        stored_name = generate_stored_filename(original_name)
        save_path = os.path.join(upload_folder, stored_name)

        # Prevent path traversal: resolve and ensure still under upload folder
        real_upload = os.path.realpath(upload_folder)
        real_path = os.path.realpath(save_path)
        if not real_path.startswith(real_upload + os.sep) and real_path != real_upload:
            return None, "Invalid file path", 400

        try:
            file.save(save_path)
        except Exception:
            return None, "Failed to save uploaded file", 500

        ext = get_file_extension(original_name)
        try:
            if ext == "pdf":
                text = ResumeService.extract_pdf_text(save_path)
            elif ext == "docx":
                text = ResumeService.extract_docx_text(save_path)
            else:
                safe_remove_file(save_path)
                return None, "Unsupported media type", 415
        except ValueError as exc:
            safe_remove_file(save_path)
            return None, str(exc), 422
        except Exception:
            safe_remove_file(save_path)
            return None, "Could not read the uploaded document", 422

        if not text or len(text.strip()) < 20:
            safe_remove_file(save_path)
            return (
                None,
                "No useful text could be extracted. Scanned/image-only PDFs are not supported without OCR.",
                422,
            )

        resume = Resume(
            user_id=user.id,
            original_filename=safe_original,
            stored_filename=stored_name,
            extracted_text=text.strip(),
        )
        db.session.add(resume)
        db.session.commit()
        return resume, None, 201

    @staticmethod
    def extract_pdf_text(filepath: str) -> str:
        """Extract text from all pages using PyMuPDF. No OCR."""
        import fitz  # PyMuPDF

        parts = []
        with fitz.open(filepath) as doc:
            if doc.page_count == 0:
                raise ValueError("PDF has no pages")
            for page in doc:
                page_text = page.get_text("text") or ""
                if page_text.strip():
                    parts.append(page_text)
        text = "\n".join(parts).strip()
        if not text:
            raise ValueError(
                "No readable text found in PDF. Image-only/scanned PDFs are not supported (OCR not implemented)."
            )
        return text

    @staticmethod
    def extract_docx_text(filepath: str) -> str:
        """Extract paragraphs from a DOCX file using python-docx."""
        from docx import Document

        try:
            document = Document(filepath)
        except Exception as exc:
            raise ValueError("Could not open DOCX file") from exc

        parts = []
        for para in document.paragraphs:
            if para.text and para.text.strip():
                parts.append(para.text.strip())

        # Also pull simple table cell text
        for table in document.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text and cell.text.strip():
                        parts.append(cell.text.strip())

        text = "\n".join(parts).strip()
        if not text:
            raise ValueError("No readable text found in DOCX document")
        return text

    @staticmethod
    def analyze_resume(user: User, resume_id: int) -> Tuple[Optional[dict], Optional[str], int]:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        if resume is None:
            # Distinguish missing vs forbidden without leaking other users' IDs
            any_resume = db.session.get(Resume, resume_id)
            if any_resume is not None and any_resume.user_id != user.id:
                return None, "You do not have permission to access this resume", 403
            return None, "Resume not found", 404

        text = resume.extracted_text or ""
        if not text.strip():
            return None, "Resume has no extracted text to analyze", 422

        # Try optional LLM first; never fabricate if it fails
        llm_result = AIService.analyze_resume(text)
        if llm_result and llm_result.get("analysis_mode") == "llm":
            analysis = llm_result
        else:
            analysis = ResumeService.rule_based_analysis(text)

        resume.extracted_skills = json.dumps(analysis.get("skills") or [])
        resume.education_details = analysis.get("education")
        resume.experience_details = analysis.get("experience")
        resume.projects = json.dumps(analysis.get("projects") or [])
        suggestions = list(analysis.get("improvement_suggestions") or [])
        gaps = analysis.get("skill_gaps") or []
        if gaps:
            suggestions.append("Potential skill gaps: " + ", ".join(gaps))
        resume.improvement_suggestions = json.dumps(suggestions)
        resume.analysis_mode = analysis.get("analysis_mode", "rule_based_demo")
        db.session.commit()

        return {
            "resume_id": resume.id,
            "analysis_mode": resume.analysis_mode,
            "skills": analysis.get("skills") or [],
            "skills_by_category": analysis.get("skills_by_category") or {},
            "education": analysis.get("education"),
            "experience": analysis.get("experience"),
            "projects": analysis.get("projects") or [],
            "skill_gaps": analysis.get("skill_gaps") or [],
            "improvement_suggestions": suggestions,
        }, None, 200

    @staticmethod
    def rule_based_analysis(text: str) -> dict:
        """
        Keyword / heuristic resume analysis.
        Labelled as rule_based_demo — not advanced AI.
        """
        skills_found = ResumeService.extract_skills_from_text(text)
        by_category = ResumeService.categorize_skills(skills_found)
        education = ResumeService.extract_section(text, ["education", "academic", "qualification"])
        experience = ResumeService.extract_section(
            text, ["experience", "work history", "employment", "internship"]
        )
        projects = ResumeService.extract_projects(text)

        # Simple gap heuristics relative to a generic software role
        common_expected = {"Git", "SQL", "JavaScript", "Python", "Java"}
        found_set = set(skills_found)
        skill_gaps = sorted(common_expected - found_set)

        suggestions = []
        if len(skills_found) < 5:
            suggestions.append(
                "Add more specific technical skills (languages, frameworks, tools) to your resume."
            )
        if not projects:
            suggestions.append(
                "Include 1–2 project descriptions with technologies used and your contributions."
            )
        if not education:
            suggestions.append("Add an Education section with degree, institution, and year.")
        if not experience:
            suggestions.append(
                "Add work or internship experience with measurable outcomes where possible."
            )
        if len(text) < 400:
            suggestions.append(
                "Resume text seems short — expand with concrete achievements and responsibilities."
            )
        if not suggestions:
            suggestions.append(
                "Quantify achievements (metrics) and tailor skills to the target job role."
            )

        return {
            "skills": skills_found,
            "skills_by_category": by_category,
            "education": education,
            "experience": experience,
            "projects": projects,
            "skill_gaps": skill_gaps,
            "improvement_suggestions": suggestions,
            "analysis_mode": "rule_based_demo",
        }

    @staticmethod
    def extract_skills_from_text(text: str) -> list:
        """Case-insensitive whole-word / phrase matching against SKILL_DICTIONARY."""
        if not text:
            return []
        found = []
        lower_text = text.lower()
        for skill in ALL_SKILLS:
            pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill.lower()) + r"(?![a-zA-Z0-9])"
            # Special-case single letter C so we don't match "CSS", "C++" wrongly —
            # C++ and CSS are separate dictionary entries checked first (longer first).
            if re.search(pattern, lower_text, flags=re.IGNORECASE):
                if skill not in found:
                    found.append(skill)
        return found

    @staticmethod
    def categorize_skills(skills: list) -> dict:
        result = {k: [] for k in SKILL_DICTIONARY}
        skill_set = set(skills)
        for category, items in SKILL_DICTIONARY.items():
            for item in items:
                if item in skill_set:
                    result[category].append(item)
        return {k: v for k, v in result.items() if v}

    @staticmethod
    def extract_section(text: str, headings: list) -> Optional[str]:
        """Pull a rough section block following a known heading."""
        lines = text.splitlines()
        start = None
        heading_pattern = re.compile(
            r"^[\s\-•*]*(" + "|".join(re.escape(h) for h in headings) + r")\s*:?\s*$",
            re.IGNORECASE,
        )
        section_breaks = re.compile(
            r"^(education|experience|projects?|skills?|certifications?|"
            r"achievements?|summary|objective|work history|internship)\s*:?\s*$",
            re.IGNORECASE,
        )

        for i, line in enumerate(lines):
            if heading_pattern.match(line.strip()):
                start = i + 1
                break

        if start is None:
            # Fallback: find heading inline
            for i, line in enumerate(lines):
                lower = line.lower()
                if any(h in lower for h in headings) and len(line.strip()) < 40:
                    start = i + 1
                    break

        if start is None:
            return None

        collected = []
        for line in lines[start : start + 12]:
            if section_breaks.match(line.strip()) and collected:
                break
            if line.strip():
                collected.append(line.strip())
        return "\n".join(collected) if collected else None

    @staticmethod
    def extract_projects(text: str) -> list:
        section = ResumeService.extract_section(
            text, ["projects", "project", "academic projects", "personal projects"]
        )
        if not section:
            return []
        projects = []
        for line in section.splitlines():
            cleaned = re.sub(r"^[\-\•\*\d\.\)\s]+", "", line).strip()
            if cleaned and len(cleaned) > 3:
                projects.append(cleaned[:200])
        return projects[:10]

    @staticmethod
    def get_resume_for_user(user: User, resume_id: int) -> Tuple[Optional[Resume], Optional[str], int]:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        if resume is None:
            any_resume = db.session.get(Resume, resume_id)
            if any_resume is not None and any_resume.user_id != user.id:
                return None, "You do not have permission to access this resume", 403
            return None, "Resume not found", 404
        return resume, None, 200

    @staticmethod
    def list_resumes(user: User) -> list:
        resumes = (
            Resume.query.filter_by(user_id=user.id)
            .order_by(Resume.created_at.desc())
            .all()
        )
        return [r.to_dict() for r in resumes]

    @staticmethod
    def delete_resume(user: User, resume_id: int) -> Tuple[bool, Optional[str], int]:
        resume, err, status = ResumeService.get_resume_for_user(user, resume_id)
        if err:
            return False, err, status

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        filepath = os.path.join(upload_folder, resume.stored_filename)
        safe_remove_file(filepath)

        db.session.delete(resume)
        db.session.commit()
        return True, None, 200
