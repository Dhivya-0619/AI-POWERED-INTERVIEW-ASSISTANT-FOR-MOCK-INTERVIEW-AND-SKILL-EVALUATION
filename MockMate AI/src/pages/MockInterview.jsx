import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2 } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import Modal from '../components/Modal';
import Button from '../components/Button';

const MockInterview = () => {
  const {
    activeSetup,
    generatedQuestions,
    generationSource,
    activeInterviewId,
    setCurrentSession,
    addCompletedSession,
    showToast,
  } = useAuth();
  const navigate = useNavigate();

  const [questions] = useState(() => generatedQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    (activeSetup.durationMinutes || 20) * 60
  );
  const [showEndModal, setShowEndModal] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!questions.length) {
      showToast('Generate questions from Interview Setup first.', 'info');
      navigate('/interview-setup', { replace: true });
    }
  }, [questions.length, navigate, showToast]);

  useEffect(() => {
    if (!questions.length) return undefined;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerChange = (val) => {
    setAnswers({
      ...answers,
      [currentIndex]: val,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishInterview();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      showToast('Question skipped', 'info');
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const completedSession = {
      id: activeInterviewId
        ? `interview_${activeInterviewId}`
        : `session_${Date.now()}`,
      interviewId: activeInterviewId,
      title: `${activeSetup.jobRole || 'Software'} Mock Interview`,
      type: activeSetup.interviewType || 'Technical',
      role: activeSetup.jobRole || 'Full Stack Developer',
      date: new Date().toISOString().split('T')[0],
      questionsCount: questions.length,
      score: null,
      scoreNote: 'Evaluation scoring is Phase 2 — not computed by the API yet.',
      duration: `${activeSetup.durationMinutes || 20} mins`,
      answers,
      questions,
      generation_source: generationSource,
      status: 'Completed (local preview)',
    };

    setCurrentSession(completedSession);
    addCompletedSession(completedSession);
    showToast('Session finished. Opening evaluation preview.', 'info');
    navigate('/evaluation');
  };

  if (!questions.length) return null;

  const currentQ = questions[currentIndex] || questions[0];
  const questionText = currentQ.question || currentQ.question_text || '';
  const category =
    currentQ.category || currentQ.question_type || activeSetup.interviewType;
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="interview-page">
      {/* Top status bar */}
      <section className="interview-status">
        <div className="interview-status-top">
          <div className="interview-status-meta">
            <div className="interview-tags">
              <span className="interview-tag">{activeSetup.interviewType} round</span>
              <span className="interview-tag interview-tag-muted">
                {activeSetup.difficulty}
              </span>
              {generationSource && (
                <span className="interview-tag interview-tag-soft">
                  {generationSource.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <h1 className="interview-title">
              {activeSetup.jobRole || 'Software Engineering'} mock session
            </h1>
          </div>

          <div className="interview-status-actions">
            <div className="interview-timer">
              <Clock size={18} className="interview-timer-icon" />
              <div>
                <p className="interview-timer-label">Time remaining</p>
                <p className="interview-timer-value">{formatTimer(timeLeftSeconds)}</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowEndModal(true)}>
              End session
            </Button>
          </div>
        </div>

        <div className="interview-progress">
          <div className="interview-progress-labels">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="interview-progress-track">
            <div
              className="interview-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      <div className="interview-layout">
        {/* Sidebar info */}
        <aside className="interview-aside">
          <div className="interview-panel">
            <h3 className="interview-panel-title">Session info</h3>
            <dl className="interview-info-list">
              <div className="interview-info-row">
                <dt>Role</dt>
                <dd title={activeSetup.jobRole}>{activeSetup.jobRole}</dd>
              </div>
              <div className="interview-info-row">
                <dt>Mode</dt>
                <dd>{activeSetup.responseMode || 'Text Response'}</dd>
              </div>
              <div className="interview-info-row">
                <dt>Question</dt>
                <dd>
                  {currentIndex + 1} / {questions.length}
                </dd>
              </div>
            </dl>
          </div>

          <div className="interview-panel">
            <h3 className="interview-panel-title">Tips</h3>
            <ul className="interview-tips">
              <li>
                <CheckCircle2 size={16} />
                <span>Answer clearly and include key technical terms.</span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>You can type or use voice dictation for your response.</span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>Scoring preview opens after you finish the session.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main workspace */}
        <div className="interview-main">
          <div className="interview-workspace-banner">
            <div>
              <h2>Practice workspace</h2>
              <p>Type your answer below, then continue to the next question.</p>
            </div>
            <span className="interview-live-pill">Session active</span>
          </div>

          <QuestionCard
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            questionText={questionText}
            category={category}
            answer={answers[currentIndex] || ''}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleNext}
            onSkip={handleSkip}
            onPrevious={handlePrevious}
            isFirstQuestion={currentIndex === 0}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        </div>
      </div>

      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End interview early?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEndModal(false)}>
              Continue session
            </Button>
            <Button variant="danger" onClick={finishInterview}>
              Finish session
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          End this practice session now? Your typed answers will be saved locally for
          the evaluation preview.
        </p>
      </Modal>
    </div>
  );
};

export default MockInterview;
