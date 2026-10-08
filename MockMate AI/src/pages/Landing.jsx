import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  UploadCloud,
  Sliders,
  Award,
  CheckCircle2,
  FileCheck,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  Target,
} from 'lucide-react';
import Button from '../components/Button';

const BrandMark = ({ large = false }) => (
  <div
    className={`rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-900/40 shrink-0 ${
      large ? 'w-14 h-14' : 'w-11 h-11'
    }`}
  >
    <span
      className={`font-heading text-white leading-none ${large ? 'text-2xl' : 'text-xl'}`}
    >
      M
    </span>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      icon: UploadCloud,
      title: 'Upload resume',
      desc: 'Upload a PDF or DOCX file. We extract skills and projects with clear, transparent analysis.',
    },
    {
      step: '02',
      icon: Sliders,
      title: 'Configure round',
      desc: 'Choose Technical, HR, Behavioral, or Mixed — then set role, difficulty, and duration.',
    },
    {
      step: '03',
      icon: Award,
      title: 'Generate questions',
      desc: 'Get a personalized question set from the bank, tuned to your resume when enabled.',
    },
  ];

  const features = [
    {
      icon: FileCheck,
      title: 'Resume analysis',
      desc: 'Secure upload with skill extraction and practical improvement suggestions.',
    },
    {
      icon: MessageSquare,
      title: 'Personalized questions',
      desc: 'Role, difficulty, and resume-aware prompts from a real question bank.',
    },
    {
      icon: Target,
      title: 'Structured practice',
      desc: 'Timed mock workspace so you can rehearse answers before the real interview.',
    },
    {
      icon: BarChart3,
      title: 'Progress tracking',
      desc: 'Keep a clear history of practice sessions as you improve over time.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by design',
      desc: 'Protected accounts, hashed passwords, ownership checks, and safe file handling.',
    },
    {
      icon: CheckCircle2,
      title: 'Transparent AI labels',
      desc: 'Clear distinction between rule-based analysis and optional LLM mode.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-grid" aria-hidden />

        <header className="landing-header">
          <div className="landing-container landing-header-inner">
            <button type="button" className="landing-brand" onClick={() => navigate('/')}>
              <BrandMark />
              <span className="landing-brand-text">
                <span className="landing-brand-name">MockMate</span>
                <span className="landing-brand-tag">Interview Assistant</span>
              </span>
            </button>

            <nav className="landing-nav">
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <a href="#about">About</a>
            </nav>

            <div className="landing-header-actions">
              <Link to="/login" className="landing-link-quiet">
                Sign in
              </Link>
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
                icon={ArrowRight}
                className="shimmer-effect"
              >
                Get started
              </Button>
            </div>
          </div>
        </header>

        <section className="landing-hero-body">
          <div className="landing-container">
            <div className="landing-hero-copy rise-in">
              <p className="landing-eyebrow">MockMate</p>
              <h1 className="landing-hero-title rise-in rise-in-delay-1">
                Prepare for interviews with calm, structured practice.
              </h1>
              <p className="landing-hero-desc rise-in rise-in-delay-2">
                Upload your resume, configure a mock round, and generate personalized
                questions — designed for students and early-career developers.
              </p>
              <div className="landing-hero-cta rise-in rise-in-delay-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  icon={ArrowRight}
                  className="shimmer-effect"
                >
                  Start practicing
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="landing-btn-ghost"
                >
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-section-muted">
        <div className="landing-container">
          <div className="landing-section-head">
            <p className="landing-kicker">How it works</p>
            <h2 className="landing-section-title">
              Three steps from resume to ready questions.
            </h2>
            <p className="landing-section-desc">
              A simple flow that keeps every step clear and easy to follow.
            </p>
          </div>

          <div className="landing-steps">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.step} className="landing-step-card">
                  <div className="landing-step-top">
                    <span className="landing-step-num">{s.step}</span>
                    <span className="landing-step-icon">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                  </div>
                  <h3 className="landing-card-title">{s.title}</h3>
                  <p className="landing-card-desc">{s.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section landing-section-white">
        <div className="landing-container">
          <div className="landing-section-head">
            <p className="landing-kicker">Features</p>
            <h2 className="landing-section-title">
              Everything you need to practice with confidence.
            </h2>
            <p className="landing-section-desc">
              From resume upload to personalized questions — organized, secure, and easy
              to use.
            </p>
          </div>

          <div className="landing-features">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <article key={f.title} className="landing-feature-card">
                  <span className="landing-feature-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="landing-card-title">{f.title}</h3>
                  <p className="landing-card-desc">{f.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-band">
        <div className="landing-hero-grid landing-cta-grid" aria-hidden />
        <div className="landing-container landing-cta-inner">
          <h2 className="landing-cta-title">Ready when your next interview is.</h2>
          <p className="landing-cta-desc">
            Create an account, upload your resume, and generate your first question set
            in minutes.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            icon={ArrowRight}
            className="shimmer-effect"
          >
            Create free account
          </Button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="landing-section landing-section-muted">
        <div className="landing-container landing-about">
          <p className="landing-kicker">About</p>
          <h2 className="landing-section-title">
            Built for serious interview preparation
          </h2>
          <p className="landing-about-desc">
            MockMate is an AI-powered interview assistant that helps candidates practice
            mock interviews with resume-aware questions, structured setups, and a clear
            path from preparation to performance.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <BrandMark />
            <div>
              <p className="landing-footer-name">MockMate</p>
              <p className="landing-footer-tag">Interview Assistant</p>
            </div>
          </div>

          <div className="landing-footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          <p className="landing-footer-copy">© 2026 MockMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
