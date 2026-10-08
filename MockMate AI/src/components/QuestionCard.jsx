import React, { useState, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2 } from 'lucide-react';
import Button from './Button';

const QuestionCard = ({
  questionNumber,
  totalQuestions,
  questionText,
  category,
  answer,
  onAnswerChange,
  onSubmit,
  onSkip,
  onPrevious,
  isLastQuestion,
  isFirstQuestion,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onAnswerChange(answer ? `${answer} ${transcript}` : transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    setRecognitionInstance(recognition);
  }, []);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionInstance?.stop();
      setIsRecording(false);
      return;
    }
    if (recognitionInstance) {
      try {
        recognitionInstance.start();
        setIsRecording(true);
      } catch {
        setIsRecording(true);
      }
    }
  };

  const formatSecs = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const wordCount = answer ? answer.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="qcard">
      <div className="qcard-header">
        <div className="qcard-header-left">
          <span className="qcard-number">{questionNumber}</span>
          <span className="qcard-meta">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <span className="qcard-category">{category || 'Technical'}</span>
      </div>

      <h2 className="qcard-question">{questionText}</h2>

      <div className={`qcard-voice ${isRecording ? 'is-recording' : ''}`}>
        <button
          type="button"
          className="qcard-mic"
          onClick={toggleRecording}
          title={isRecording ? 'Stop recording' : 'Start voice dictation'}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <div className="qcard-voice-copy">
          <p className="qcard-voice-title">
            {isRecording ? 'Listening…' : 'Optional voice dictation'}
          </p>
          <p className="qcard-voice-sub">
            {isRecording
              ? `Recording ${formatSecs(recordingTime)}`
              : 'Click the microphone to dictate, or type your answer below.'}
          </p>
        </div>
      </div>

      <div className="qcard-answer">
        <div className="qcard-answer-top">
          <label htmlFor="interview-answer">Your answer</label>
          <span>{wordCount} words</span>
        </div>
        <textarea
          id="interview-answer"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={7}
          placeholder="Type your structured response here…"
          className="qcard-textarea"
        />
      </div>

      <div className="qcard-actions">
        <div className="qcard-actions-left">
          {!isFirstQuestion && (
            <Button variant="secondary" size="sm" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onSkip}>
            Skip
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!answer.trim()}
          icon={isLastQuestion ? CheckCircle2 : undefined}
          className="shimmer-effect"
        >
          {isLastQuestion ? 'Finish & view evaluation' : 'Save & next question'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionCard;
