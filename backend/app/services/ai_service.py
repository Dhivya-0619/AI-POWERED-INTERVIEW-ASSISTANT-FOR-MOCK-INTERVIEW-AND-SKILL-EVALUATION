"""
Optional LLM integration service.

When AI_PROVIDER / AI_API_KEY / AI_MODEL are not configured, all methods
return None so callers fall back to rule-based logic.

Never fabricate AI results. Never expose API keys.
"""

from __future__ import annotations

import json
import re
from typing import Any, Optional

from flask import current_app


class AIService:
    """Thin wrapper for optional external LLM providers."""

    @staticmethod
    def is_configured() -> bool:
        provider = (current_app.config.get("AI_PROVIDER") or "").strip()
        api_key = (current_app.config.get("AI_API_KEY") or "").strip()
        model = (current_app.config.get("AI_MODEL") or "").strip()
        return bool(provider and api_key and model)

    @staticmethod
    def analyze_resume(extracted_text: str) -> Optional[dict]:
        """
        Attempt LLM-based resume analysis.
        Returns a structured dict on success, or None to trigger rule-based fallback.
        """
        if not AIService.is_configured():
            return None

        provider = current_app.config["AI_PROVIDER"].lower()
        try:
            if provider in ("openai", "openai_compatible"):
                return AIService._openai_resume_analysis(extracted_text)
            # Unknown provider — do not invent results
            return None
        except Exception:
            # Fail closed: caller must use rule-based analysis
            return None

    @staticmethod
    def generate_questions(prompt_context: dict, count: int) -> Optional[list]:
        """
        Attempt LLM question generation.
        Returns a list of question dicts or None for fallback.
        """
        if not AIService.is_configured():
            return None

        provider = current_app.config["AI_PROVIDER"].lower()
        try:
            if provider in ("openai", "openai_compatible"):
                return AIService._openai_generate_questions(prompt_context, count)
            return None
        except Exception:
            return None

    # ------------------------------------------------------------------
    # OpenAI-compatible helpers (optional; only used when configured)
    # ------------------------------------------------------------------

    @staticmethod
    def _openai_chat(messages: list, temperature: float = 0.4) -> Optional[str]:
        """Call OpenAI Chat Completions API. Returns content string or None."""
        try:
            import urllib.error
            import urllib.request
        except ImportError:
            return None

        api_key = current_app.config["AI_API_KEY"]
        model = current_app.config["AI_MODEL"]
        base_url = "https://api.openai.com/v1/chat/completions"

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            base_url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            return body["choices"][0]["message"]["content"]
        except Exception:
            return None

    @staticmethod
    def _parse_json_content(content: str) -> Optional[Any]:
        if not content:
            return None
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", content)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    return None
        return None

    @staticmethod
    def _openai_resume_analysis(extracted_text: str) -> Optional[dict]:
        truncated = (extracted_text or "")[:8000]
        messages = [
            {
                "role": "system",
                "content": (
                    "You analyze resumes for interview preparation. "
                    "Respond with JSON only using keys: skills (list of strings), "
                    "education (string), experience (string), projects (list of strings), "
                    "skill_gaps (list of strings), improvement_suggestions (list of strings)."
                ),
            },
            {
                "role": "user",
                "content": f"Analyze this resume text:\n\n{truncated}",
            },
        ]
        content = AIService._openai_chat(messages)
        parsed = AIService._parse_json_content(content)
        if not isinstance(parsed, dict):
            return None

        skills = parsed.get("skills")
        if not isinstance(skills, list):
            return None

        return {
            "skills": [str(s).strip() for s in skills if str(s).strip()],
            "education": str(parsed.get("education") or "").strip() or None,
            "experience": str(parsed.get("experience") or "").strip() or None,
            "projects": [
                str(p).strip()
                for p in (parsed.get("projects") or [])
                if str(p).strip()
            ]
            if isinstance(parsed.get("projects"), list)
            else [],
            "skill_gaps": [
                str(g).strip()
                for g in (parsed.get("skill_gaps") or [])
                if str(g).strip()
            ]
            if isinstance(parsed.get("skill_gaps"), list)
            else [],
            "improvement_suggestions": [
                str(s).strip()
                for s in (parsed.get("improvement_suggestions") or [])
                if str(s).strip()
            ]
            if isinstance(parsed.get("improvement_suggestions"), list)
            else [],
            "analysis_mode": "llm",
        }

    @staticmethod
    def _openai_generate_questions(prompt_context: dict, count: int) -> Optional[list]:
        messages = [
            {
                "role": "system",
                "content": (
                    "You generate mock interview questions. "
                    "Respond with JSON only: {\"questions\": [{\"question_text\": \"...\", "
                    "\"question_type\": \"Technical|HR|Behavioral\", "
                    "\"difficulty\": \"Beginner|Intermediate|Advanced\", "
                    "\"expected_answer\": \"brief notes\"}]}. "
                    f"Generate exactly {count} unique questions."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(prompt_context),
            },
        ]
        content = AIService._openai_chat(messages, temperature=0.6)
        parsed = AIService._parse_json_content(content)
        if not isinstance(parsed, dict):
            return None

        questions = parsed.get("questions")
        if not isinstance(questions, list) or len(questions) == 0:
            return None

        validated = []
        for q in questions:
            if not isinstance(q, dict):
                continue
            text = str(q.get("question_text") or "").strip()
            if not text:
                continue
            validated.append(
                {
                    "question_text": text,
                    "question_type": str(
                        q.get("question_type") or prompt_context.get("interview_type") or "Technical"
                    ).strip(),
                    "difficulty": str(
                        q.get("difficulty") or prompt_context.get("difficulty") or "Intermediate"
                    ).strip(),
                    "expected_answer": str(q.get("expected_answer") or "").strip() or None,
                    "generation_source": "llm",
                }
            )

        if len(validated) < 1:
            return None
        return validated[:count]
