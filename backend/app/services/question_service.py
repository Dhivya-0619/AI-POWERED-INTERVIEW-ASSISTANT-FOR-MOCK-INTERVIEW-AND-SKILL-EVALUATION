"""
Question generation service.

Uses an optional LLM when configured; otherwise a real fallback question bank
and deterministic resume-based templates.
generation_source is either "llm" or "fallback_rule_based".
"""

from __future__ import annotations

import json
import random
from typing import Optional, Tuple

from app.extensions import db
from app.models.interview import Interview
from app.models.question import Question
from app.models.resume import Resume
from app.models.user import User
from app.services.ai_service import AIService

# ---------------------------------------------------------------------------
# Fallback question bank (rule-based — not LLM)
# ---------------------------------------------------------------------------

QUESTION_BANK = {
    "Java": [
        {
            "text": "What is the difference between method overloading and method overriding?",
            "type": "Technical",
            "expected": "Overloading: same method name, different parameters (compile-time). Overriding: subclass redefines parent method (runtime).",
        },
        {
            "text": "What is the difference between an interface and an abstract class in Java?",
            "type": "Technical",
            "expected": "Interfaces define contracts; abstract classes can have state and concrete methods. Discuss multiple inheritance implications.",
        },
        {
            "text": "What are the main features of object-oriented programming?",
            "type": "Technical",
            "expected": "Encapsulation, inheritance, polymorphism, abstraction.",
        },
        {
            "text": "What is the Java Collections Framework?",
            "type": "Technical",
            "expected": "Unified architecture for storing/manipulating groups of objects: List, Set, Map, Queue and implementations.",
        },
        {
            "text": "Explain the difference between checked and unchecked exceptions in Java.",
            "type": "Technical",
            "expected": "Checked must be declared/handled; unchecked (RuntimeException) need not be.",
        },
        {
            "text": "What is multithreading in Java and how do you create a thread?",
            "type": "Technical",
            "expected": "Concurrent execution; extend Thread or implement Runnable; mention ExecutorService.",
        },
        {
            "text": "Explain the JVM memory areas: heap, stack, and method area.",
            "type": "Technical",
            "expected": "Heap for objects, stack for frames/locals, method area for class metadata.",
        },
        {
            "text": "What is the difference between ArrayList and LinkedList?",
            "type": "Technical",
            "expected": "ArrayList: contiguous array, fast random access. LinkedList: nodes, better for frequent insert/delete.",
        },
    ],
    "Python": [
        {
            "text": "What are Python lists and dictionaries, and when would you use each?",
            "type": "Technical",
            "expected": "Lists are ordered sequences; dicts are key-value maps for fast lookup.",
        },
        {
            "text": "Explain the difference between a list and a tuple in Python.",
            "type": "Technical",
            "expected": "Lists are mutable; tuples are immutable and hashable when elements are hashable.",
        },
        {
            "text": "What is a Python decorator and give a practical use case?",
            "type": "Technical",
            "expected": "A function that wraps another to add behavior (logging, auth, timing).",
        },
        {
            "text": "How does exception handling work in Python?",
            "type": "Technical",
            "expected": "try/except/else/finally; catch specific exceptions; avoid bare except.",
        },
        {
            "text": "What are *args and **kwargs?",
            "type": "Technical",
            "expected": "Variable positional and keyword arguments for flexible function signatures.",
        },
        {
            "text": "Explain list comprehensions with an example.",
            "type": "Technical",
            "expected": "Concise way to build lists: [x*2 for x in nums if x > 0].",
        },
    ],
    "JavaScript": [
        {
            "text": "What is the difference between var, let, and const?",
            "type": "Technical",
            "expected": "var is function-scoped; let/const are block-scoped; const cannot be reassigned.",
        },
        {
            "text": "Explain closures in JavaScript.",
            "type": "Technical",
            "expected": "A function retaining access to its lexical scope after the outer function returns.",
        },
        {
            "text": "What is the event loop in JavaScript?",
            "type": "Technical",
            "expected": "Mechanism that handles async callbacks via call stack, queue, and microtasks.",
        },
        {
            "text": "What are promises and async/await?",
            "type": "Technical",
            "expected": "Promises represent future values; async/await is syntactic sugar over promises.",
        },
    ],
    "React": [
        {
            "text": "What are React components and what is the difference between functional and class components?",
            "type": "Technical",
            "expected": "Reusable UI units; functional components with hooks are the modern default.",
        },
        {
            "text": "Explain the React useState and useEffect hooks.",
            "type": "Technical",
            "expected": "useState for local state; useEffect for side effects after render.",
        },
        {
            "text": "What is the virtual DOM and why does React use it?",
            "type": "Technical",
            "expected": "In-memory representation used to minimize expensive real DOM updates via diffing.",
        },
        {
            "text": "How do you pass data from a parent to a child component in React?",
            "type": "Technical",
            "expected": "Via props; discuss one-way data flow.",
        },
    ],
    "Node.js": [
        {
            "text": "What is Node.js and how does its non-blocking I/O model work?",
            "type": "Technical",
            "expected": "JS runtime on V8; event-driven non-blocking I/O via libuv.",
        },
        {
            "text": "How would you structure a REST API using Express?",
            "type": "Technical",
            "expected": "Routes, controllers, middleware, error handling, modular routers.",
        },
    ],
    "Spring Boot": [
        {
            "text": "What is Spring Boot and what problems does it solve?",
            "type": "Technical",
            "expected": "Opinionated Spring setup with auto-configuration and embedded servers.",
        },
        {
            "text": "How would you create a REST API using Spring Boot?",
            "type": "Technical",
            "expected": "@RestController, request mappings, DTOs, service layer, repository.",
        },
        {
            "text": "Explain dependency injection in Spring.",
            "type": "Technical",
            "expected": "IoC container injects beans via constructor/setter/field; prefer constructor injection.",
        },
    ],
    "Flask": [
        {
            "text": "How do you define routes and return JSON responses in Flask?",
            "type": "Technical",
            "expected": "@app.route / blueprints; jsonify for JSON responses.",
        },
        {
            "text": "What is the application factory pattern in Flask and why use it?",
            "type": "Technical",
            "expected": "create_app() for configurable apps, testing, and multiple instances.",
        },
    ],
    "Django": [
        {
            "text": "Explain the Django MTV architecture.",
            "type": "Technical",
            "expected": "Model-Template-View; ORM, templates, views/URLconf.",
        },
        {
            "text": "How does Django's ORM help interact with the database?",
            "type": "Technical",
            "expected": "Models map to tables; QuerySets for queries without raw SQL.",
        },
    ],
    "SQL": [
        {
            "text": "What is normalization in databases?",
            "type": "Technical",
            "expected": "Organizing data to reduce redundancy; 1NF, 2NF, 3NF concepts.",
        },
        {
            "text": "What is the difference between a primary key and a foreign key?",
            "type": "Technical",
            "expected": "PK uniquely identifies a row; FK references a PK in another table.",
        },
        {
            "text": "Explain the difference between INNER JOIN and LEFT JOIN.",
            "type": "Technical",
            "expected": "INNER returns matching rows only; LEFT keeps all left rows with NULLs for non-matches.",
        },
        {
            "text": "What is an index and when should you use one?",
            "type": "Technical",
            "expected": "Structure speeding lookups; useful for frequent filters/joins; costs write overhead.",
        },
    ],
    "DBMS": [
        {
            "text": "What is normalization?",
            "type": "Technical",
            "expected": "Process of structuring relational data to minimize redundancy and anomalies.",
        },
        {
            "text": "What is the difference between a primary key and a foreign key?",
            "type": "Technical",
            "expected": "Primary key uniquely identifies records; foreign key enforces referential integrity.",
        },
        {
            "text": "Explain ACID properties of a database transaction.",
            "type": "Technical",
            "expected": "Atomicity, Consistency, Isolation, Durability.",
        },
        {
            "text": "Explain the difference between INNER JOIN and LEFT JOIN.",
            "type": "Technical",
            "expected": "INNER: matches only; LEFT: all from left table plus matches.",
        },
    ],
    "MySQL": [
        {
            "text": "How do you optimize a slow MySQL query?",
            "type": "Technical",
            "expected": "EXPLAIN, indexes, avoid SELECT *, limit result sets, schema review.",
        },
        {
            "text": "What is the difference between MyISAM and InnoDB storage engines?",
            "type": "Technical",
            "expected": "InnoDB: transactions, FK, row locks; MyISAM: table locks, no transactions.",
        },
    ],
    "PostgreSQL": [
        {
            "text": "What are some advantages of PostgreSQL over other relational databases?",
            "type": "Technical",
            "expected": "Standards compliance, JSONB, extensions, strong concurrency (MVCC).",
        },
    ],
    "MongoDB": [
        {
            "text": "When would you choose MongoDB over a relational database?",
            "type": "Technical",
            "expected": "Flexible schemas, document model, horizontal scaling for certain workloads.",
        },
        {
            "text": "Explain collections and documents in MongoDB.",
            "type": "Technical",
            "expected": "Collections hold documents (BSON); analogous to tables/rows but schemaless.",
        },
    ],
    "AWS": [
        {
            "text": "What AWS services would you use to deploy a web application?",
            "type": "Technical",
            "expected": "EC2/ECS/Lambda, S3, RDS, ALB, IAM, CloudWatch — justify choices.",
        },
        {
            "text": "Explain the difference between S3 and EBS.",
            "type": "Technical",
            "expected": "S3: object storage; EBS: block storage attached to EC2.",
        },
    ],
    "Azure": [
        {
            "text": "Name key Azure services used for hosting and storing application data.",
            "type": "Technical",
            "expected": "App Service, AKS, Blob Storage, Azure SQL, Functions.",
        },
    ],
    "Docker": [
        {
            "text": "What is a Docker container and how does it differ from a virtual machine?",
            "type": "Technical",
            "expected": "Containers share the host OS kernel; VMs include a full guest OS.",
        },
        {
            "text": "What is a Dockerfile and what are common instructions?",
            "type": "Technical",
            "expected": "FROM, COPY, RUN, CMD/ENTRYPOINT, EXPOSE, WORKDIR.",
        },
    ],
    "Git": [
        {
            "text": "Explain the difference between git merge and git rebase.",
            "type": "Technical",
            "expected": "Merge preserves history with a merge commit; rebase replays commits linearly.",
        },
        {
            "text": "What is a pull request and why is it useful in team projects?",
            "type": "Technical",
            "expected": "Code review workflow before merging; quality and knowledge sharing.",
        },
    ],
    "GitHub": [
        {
            "text": "How do you resolve merge conflicts on GitHub?",
            "type": "Technical",
            "expected": "Pull latest, resolve locally, test, commit, push; use PR conflict UI if needed.",
        },
    ],
    "HTML": [
        {
            "text": "What is semantic HTML and why is it important?",
            "type": "Technical",
            "expected": "Meaningful tags (header, nav, main) improve accessibility and SEO.",
        },
    ],
    "CSS": [
        {
            "text": "Explain the CSS box model.",
            "type": "Technical",
            "expected": "Content, padding, border, margin; box-sizing behavior.",
        },
        {
            "text": "What is Flexbox and when would you use it?",
            "type": "Technical",
            "expected": "One-dimensional layout for aligning/distributing items in a container.",
        },
    ],
    "Machine Learning": [
        {
            "text": "What is the difference between supervised and unsupervised learning?",
            "type": "Technical",
            "expected": "Supervised uses labeled data; unsupervised finds structure without labels.",
        },
        {
            "text": "What is overfitting and how can you reduce it?",
            "type": "Technical",
            "expected": "Model memorizes training data; use regularization, more data, cross-validation.",
        },
    ],
    "Deep Learning": [
        {
            "text": "What is a neural network and what are activation functions used for?",
            "type": "Technical",
            "expected": "Layers of neurons; activations introduce non-linearity (ReLU, sigmoid, etc.).",
        },
    ],
    "TensorFlow": [
        {
            "text": "How would you build and train a simple model using TensorFlow/Keras?",
            "type": "Technical",
            "expected": "Define Sequential/Functional model, compile, fit, evaluate.",
        },
    ],
    "PyTorch": [
        {
            "text": "What are tensors in PyTorch and why are they important?",
            "type": "Technical",
            "expected": "Multi-dimensional arrays with autograd support for training models.",
        },
    ],
    "OOP": [
        {
            "text": "Explain encapsulation with a real-world programming example.",
            "type": "Technical",
            "expected": "Hide internal state; expose controlled methods (getters/setters, invariants).",
        },
        {
            "text": "What is polymorphism and how is it useful in large codebases?",
            "type": "Technical",
            "expected": "Same interface, different implementations; enables extensibility.",
        },
        {
            "text": "What are the main features of object-oriented programming?",
            "type": "Technical",
            "expected": "Encapsulation, inheritance, polymorphism, abstraction.",
        },
    ],
    "C++": [
        {
            "text": "What is the difference between a pointer and a reference in C++?",
            "type": "Technical",
            "expected": "Pointers can be reseated/null; references are aliases that must be initialized.",
        },
        {
            "text": "Explain RAII in C++.",
            "type": "Technical",
            "expected": "Resource Acquisition Is Initialization — tie resource lifetime to object lifetime.",
        },
    ],
    "C": [
        {
            "text": "What is the difference between stack and heap memory in C?",
            "type": "Technical",
            "expected": "Stack for automatic locals; heap via malloc/free for dynamic allocation.",
        },
        {
            "text": "Explain pointers and why they are important in C.",
            "type": "Technical",
            "expected": "Variables storing addresses; enable dynamic memory and efficient data structures.",
        },
    ],
    "HR": [
        {
            "text": "Tell me about yourself.",
            "type": "HR",
            "expected": "Concise professional summary: background, skills, interest in the role.",
        },
        {
            "text": "Why are you interested in this role?",
            "type": "HR",
            "expected": "Align skills and goals with company/role; show research and motivation.",
        },
        {
            "text": "What are your strengths and areas for improvement?",
            "type": "HR",
            "expected": "Honest strengths with examples; growth-oriented improvement areas.",
        },
        {
            "text": "Where do you see yourself in five years?",
            "type": "HR",
            "expected": "Realistic career growth aligned with the field/company.",
        },
        {
            "text": "Why should we hire you?",
            "type": "HR",
            "expected": "Unique value: skills, projects, attitude, culture fit.",
        },
        {
            "text": "Are you willing to relocate or work flexible hours if required?",
            "type": "HR",
            "expected": "Honest preference with willingness where applicable.",
        },
    ],
    "Behavioral": [
        {
            "text": "Describe a challenging situation you faced during a project.",
            "type": "Behavioral",
            "expected": "STAR: Situation, Task, Action, Result.",
        },
        {
            "text": "How do you handle disagreements in a team?",
            "type": "Behavioral",
            "expected": "Listen, find common ground, focus on goals, escalate constructively.",
        },
        {
            "text": "Describe a time when you had to learn a new technology quickly.",
            "type": "Behavioral",
            "expected": "Learning approach, resources used, outcome delivered.",
        },
        {
            "text": "Tell me about a time you failed and what you learned.",
            "type": "Behavioral",
            "expected": "Ownership, reflection, concrete improvement afterward.",
        },
        {
            "text": "Describe a time you took ownership beyond your assigned tasks.",
            "type": "Behavioral",
            "expected": "Initiative, impact, collaboration without overstepping.",
        },
        {
            "text": "How do you prioritize tasks when you have multiple deadlines?",
            "type": "Behavioral",
            "expected": "Impact/urgency matrix, communication, incremental delivery.",
        },
    ],
    "General": [
        {
            "text": "How do you stay updated with new technologies in your field?",
            "type": "Technical",
            "expected": "Docs, courses, communities, side projects, blogs.",
        },
        {
            "text": "Explain a technical project you are proud of.",
            "type": "Technical",
            "expected": "Problem, architecture, your role, results, trade-offs.",
        },
        {
            "text": "How would you debug a production issue under time pressure?",
            "type": "Technical",
            "expected": "Reproduce, logs/metrics, isolate, fix/rollback, postmortem.",
        },
        {
            "text": "What is REST and what makes an API RESTful?",
            "type": "Technical",
            "expected": "Resources, HTTP methods, statelessness, status codes, representation.",
        },
        {
            "text": "Explain the software development life cycle (SDLC) briefly.",
            "type": "Technical",
            "expected": "Requirements, design, implementation, testing, deployment, maintenance.",
        },
    ],
}

DIFFICULTY_PREFIX = {
    "Beginner": "In simple terms, ",
    "Intermediate": "",
    "Advanced": "In depth, critically analyze: ",
}


class QuestionService:
    @staticmethod
    def generate_for_interview(
        user: User, interview_id: int
    ) -> Tuple[Optional[dict], Optional[str], int]:
        interview = Interview.query.filter_by(id=interview_id, user_id=user.id).first()
        if interview is None:
            any_i = db.session.get(Interview, interview_id)
            if any_i is not None and any_i.user_id != user.id:
                return None, "You do not have permission to access this interview", 403
            return None, "Interview not found", 404

        resume = None
        resume_info = {}
        if interview.resume_id:
            resume = Resume.query.filter_by(
                id=interview.resume_id, user_id=user.id
            ).first()
            if resume:
                resume_info = {
                    "skills": resume._parse_json_list(resume.extracted_skills),
                    "projects": resume._parse_json_list(resume.projects),
                    "education": resume.education_details,
                    "experience": resume.experience_details,
                }

        count = interview.number_of_questions
        prompt_context = {
            "interview_type": interview.interview_type,
            "difficulty": interview.difficulty,
            "job_role": interview.job_role,
            "skills": interview.get_skills(),
            "use_resume_questions": interview.use_resume_questions,
            "resume": resume_info if interview.use_resume_questions else {},
            "number_of_questions": count,
        }

        generation_source = "fallback_rule_based"
        raw_questions = None

        llm_questions = AIService.generate_questions(prompt_context, count)
        if llm_questions and len(llm_questions) > 0:
            raw_questions = llm_questions
            generation_source = "llm"
        else:
            raw_questions = QuestionService._fallback_generate(
                interview_type=interview.interview_type,
                difficulty=interview.difficulty,
                job_role=interview.job_role,
                skills=interview.get_skills(),
                resume_info=resume_info if interview.use_resume_questions else {},
                count=count,
            )
            generation_source = "fallback_rule_based"

        # Replace existing questions for this interview (regeneration)
        Question.query.filter_by(interview_id=interview.id).delete()
        db.session.flush()

        saved = []
        seen_texts = set()
        order = 1
        for q in raw_questions:
            text = (q.get("question_text") or "").strip()
            if not text:
                continue
            key = text.lower()
            if key in seen_texts:
                continue
            seen_texts.add(key)

            question = Question(
                interview_id=interview.id,
                question_text=text,
                question_type=q.get("question_type") or interview.interview_type,
                difficulty=q.get("difficulty") or interview.difficulty,
                expected_answer=q.get("expected_answer"),
                question_order=order,
                generation_source=q.get("generation_source") or generation_source,
            )
            db.session.add(question)
            saved.append(question)
            order += 1
            if len(saved) >= count:
                break

        # Top up from bank if LLM returned too few unique questions
        if len(saved) < count:
            extras = QuestionService._fallback_generate(
                interview_type=interview.interview_type,
                difficulty=interview.difficulty,
                job_role=interview.job_role,
                skills=interview.get_skills(),
                resume_info=resume_info if interview.use_resume_questions else {},
                count=count * 2,
            )
            for q in extras:
                text = q["question_text"].strip()
                if text.lower() in seen_texts:
                    continue
                seen_texts.add(text.lower())
                question = Question(
                    interview_id=interview.id,
                    question_text=text,
                    question_type=q.get("question_type") or interview.interview_type,
                    difficulty=q.get("difficulty") or interview.difficulty,
                    expected_answer=q.get("expected_answer"),
                    question_order=order,
                    generation_source="fallback_rule_based",
                )
                db.session.add(question)
                saved.append(question)
                order += 1
                if len(saved) >= count:
                    break
            # If we had to mix in fallback after a partial LLM result
            if generation_source == "llm" and any(
                s.generation_source == "fallback_rule_based" for s in saved
            ):
                # Keep primary label as llm only if majority llm; else fallback
                llm_count = sum(1 for s in saved if s.generation_source == "llm")
                if llm_count < len(saved) / 2:
                    generation_source = "fallback_rule_based"

        db.session.commit()

        return {
            "generation_source": generation_source,
            "questions": [
                {
                    "id": q.id,
                    "question_order": q.question_order,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "difficulty": q.difficulty,
                }
                for q in saved
            ],
        }, None, 200

    @staticmethod
    def _fallback_generate(
        interview_type: str,
        difficulty: str,
        job_role: str,
        skills: list,
        resume_info: dict,
        count: int,
    ) -> list:
        """Deterministic/rule-based question selection — generation_source fallback_rule_based."""
        pool = []

        # Resume-personalized templates
        if resume_info:
            pool.extend(QuestionService._resume_based_questions(resume_info, difficulty))

        # Skill-based from bank
        for skill in skills or []:
            bank = QUESTION_BANK.get(skill) or QUESTION_BANK.get(skill.title())
            if bank:
                for item in bank:
                    pool.append(
                        QuestionService._bank_item_to_question(item, difficulty, skill)
                    )

        # Interview type banks
        itype = (interview_type or "Technical").strip()
        if itype == "HR":
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "HR")
                for i in QUESTION_BANK["HR"]
            )
        elif itype == "Behavioral":
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "Behavioral")
                for i in QUESTION_BANK["Behavioral"]
            )
        elif itype == "Mixed":
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "HR")
                for i in QUESTION_BANK["HR"][:3]
            )
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "Behavioral")
                for i in QUESTION_BANK["Behavioral"][:3]
            )
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "General")
                for i in QUESTION_BANK["General"]
            )
        else:  # Technical
            pool.extend(
                QuestionService._bank_item_to_question(i, difficulty, "General")
                for i in QUESTION_BANK["General"]
            )
            # Role-tinted questions
            if job_role:
                pool.append(
                    {
                        "question_text": (
                            f"What core skills are most important for a {job_role}, "
                            f"and how have you demonstrated them?"
                        ),
                        "question_type": "Technical",
                        "difficulty": difficulty,
                        "expected_answer": f"Map skills to {job_role} responsibilities with examples.",
                        "generation_source": "fallback_rule_based",
                    }
                )
                pool.append(
                    {
                        "question_text": (
                            f"Describe how you would approach a typical problem faced by a {job_role}."
                        ),
                        "question_type": "Technical",
                        "difficulty": difficulty,
                        "expected_answer": "Structured problem-solving relevant to the role.",
                        "generation_source": "fallback_rule_based",
                    }
                )

        # Deduplicate while preserving order
        unique = []
        seen = set()
        for q in pool:
            key = q["question_text"].lower().strip()
            if key in seen:
                continue
            seen.add(key)
            unique.append(q)

        # Stable shuffle based on role+skills for variety but reproducibility in tests
        seed = hash((interview_type, difficulty, job_role, tuple(skills or []))) & 0xFFFFFFFF
        rng = random.Random(seed)
        rng.shuffle(unique)

        # If still short, cycle general + HR + behavioral
        filler_sources = (
            QUESTION_BANK["General"]
            + QUESTION_BANK["HR"]
            + QUESTION_BANK["Behavioral"]
            + QUESTION_BANK["Java"]
            + QUESTION_BANK["SQL"]
        )
        filler_idx = 0
        while len(unique) < count and filler_idx < len(filler_sources) * 2:
            item = filler_sources[filler_idx % len(filler_sources)]
            filler_idx += 1
            q = QuestionService._bank_item_to_question(item, difficulty, item["type"])
            # Slightly vary text if duplicate
            key = q["question_text"].lower()
            if key in seen:
                q = dict(q)
                q["question_text"] = (
                    f"As a {job_role or 'candidate'}: {q['question_text']}"
                )
                key = q["question_text"].lower()
                if key in seen:
                    continue
            seen.add(key)
            unique.append(q)

        return unique[: max(count, len(unique))]

    @staticmethod
    def _bank_item_to_question(item: dict, difficulty: str, _skill: str) -> dict:
        prefix = DIFFICULTY_PREFIX.get(difficulty, "")
        text = item["text"]
        if prefix and difficulty == "Advanced" and not text.lower().startswith("in depth"):
            text = prefix + text[0].lower() + text[1:] if text else text
        elif prefix and difficulty == "Beginner" and not text.lower().startswith("in simple"):
            text = prefix + text[0].lower() + text[1:] if text else text
        return {
            "question_text": text,
            "question_type": item.get("type", "Technical"),
            "difficulty": difficulty,
            "expected_answer": item.get("expected"),
            "generation_source": "fallback_rule_based",
        }

    @staticmethod
    def _resume_based_questions(resume_info: dict, difficulty: str) -> list:
        questions = []
        projects = resume_info.get("projects") or []
        skills = resume_info.get("skills") or []

        for project in projects[:5]:
            # Use first clause / short title
            title = project.split(" - ")[0].split(":")[0].strip()[:80]
            if len(title) < 3:
                continue
            questions.append(
                {
                    "question_text": (
                        f"You mentioned {title} in your resume. "
                        f"Explain how you designed the backend of the system."
                    ),
                    "question_type": "Technical",
                    "difficulty": difficulty,
                    "expected_answer": f"Architecture, tech stack, and contributions for {title}.",
                    "generation_source": "fallback_rule_based",
                }
            )
            questions.append(
                {
                    "question_text": (
                        f"What challenges did you face while working on {title}, "
                        f"and how did you overcome them?"
                    ),
                    "question_type": "Behavioral",
                    "difficulty": difficulty,
                    "expected_answer": "STAR response tied to the project.",
                    "generation_source": "fallback_rule_based",
                }
            )

        for skill in skills[:8]:
            questions.append(
                {
                    "question_text": (
                        f"You listed {skill} as a skill. "
                        f"How would you apply {skill} in a real-world project?"
                    ),
                    "question_type": "Technical",
                    "difficulty": difficulty,
                    "expected_answer": f"Practical usage of {skill} with example.",
                    "generation_source": "fallback_rule_based",
                }
            )
            if skill.lower() in ("spring boot", "flask", "django", "express", "fastapi"):
                questions.append(
                    {
                        "question_text": (
                            f"You listed {skill} as a skill. "
                            f"How would you create a REST API using {skill}?"
                        ),
                        "question_type": "Technical",
                        "difficulty": difficulty,
                        "expected_answer": f"Steps to build REST endpoints with {skill}.",
                        "generation_source": "fallback_rule_based",
                    }
                )

        return questions

    @staticmethod
    def list_questions(
        user: User, interview_id: int
    ) -> Tuple[Optional[list], Optional[str], int]:
        interview = Interview.query.filter_by(id=interview_id, user_id=user.id).first()
        if interview is None:
            any_i = db.session.get(Interview, interview_id)
            if any_i is not None and any_i.user_id != user.id:
                return None, "You do not have permission to access this interview", 403
            return None, "Interview not found", 404

        questions = (
            Question.query.filter_by(interview_id=interview.id)
            .order_by(Question.question_order.asc())
            .all()
        )
        return [q.to_dict() for q in questions], None, 200
