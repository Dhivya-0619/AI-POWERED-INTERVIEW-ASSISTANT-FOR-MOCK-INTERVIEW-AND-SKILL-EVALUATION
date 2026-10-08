import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadAndAnalyzeResumeApi } from '../services/api';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Info,
  ScanLine,
  Briefcase,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

const ResumeUpload = () => {
  const { resumeData, saveResumeAnalysis, showToast } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedResult, setParsedResult] = useState(resumeData);

  const handleFileChange = (file) => {
    if (!file) return;

    const okExt =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx');

    if (!okExt) {
      showToast('Please upload a valid PDF or DOCX file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large. Maximum size is 5 MB.', 'error');
      return;
    }

    setSelectedFile(file);
    showToast(`File selected: ${file.name}`, 'info');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showToast('Please select a resume file first.', 'error');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await uploadAndAnalyzeResumeApi(selectedFile);
      saveResumeAnalysis(res);
      setParsedResult(res);
      showToast(
        `Resume analyzed (${res.analysis_mode === 'llm' ? 'LLM' : 'rule-based'}).`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to analyze resume', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const skills = parsedResult?.detectedSkills || [];
  const suggestions = parsedResult?.improvementSuggestions || [];
  const projects = parsedResult?.projects || [];

  return (
    <div className="space-y-8 text-left">
      <PageHeader
        title="Resume Upload & Analysis"
        description="Upload your resume (PDF or DOCX). Skills are extracted via rule-based matching (or optional LLM if configured on the server)."
        badgeText="Phase 1 Backend"
      />

      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 text-indigo-900 text-xs shadow-xs">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Connected to Flask:</span> files upload to{' '}
          <code>/api/resume/upload</code>, then analysis runs at{' '}
          <code>/api/resume/analyze/&lt;id&gt;</code>. Image-only PDFs need OCR (not
          supported yet).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card relative overflow-hidden">
            <h3 className="font-bold text-slate-900 text-base font-heading mb-1">
              Select or Drop Your Resume
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Supported Formats: PDF, DOCX (Max Size: 5MB)
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 relative overflow-hidden ${
                isDragOver
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99] shadow-lg shadow-indigo-500/10'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
              }`}
            >
              {analyzing && <div className="scan-line"></div>}

              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30 animate-float">
                <UploadCloud className="w-7 h-7" />
              </div>

              <p className="text-sm font-bold text-slate-900">
                Drag & drop your resume file here
              </p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                or browse from your computer
              </p>

              <input
                type="file"
                id="resumeFileInput"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <label htmlFor="resumeFileInput">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => document.getElementById('resumeFileInput').click()}
                >
                  Browse Files
                </Button>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="primary"
                fullWidth
                loading={analyzing}
                disabled={!selectedFile}
                onClick={handleAnalyze}
                icon={Sparkles}
                className="shimmer-effect"
              >
                Upload & Analyze Resume
              </Button>
            </div>
          </div>
        </div>

        <div>
          {analyzing ? (
            <div className="card h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
              <div className="scan-line"></div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                <ScanLine className="w-8 h-8 animate-pulse text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base font-heading">
                Uploading & analyzing…
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Extracting text and matching skills against the dictionary
              </p>
            </div>
          ) : parsedResult ? (
            <div className="card space-y-6 shadow-xl border-indigo-100/60">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    Analyzed Resume
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                  {parsedResult.analysis_mode || 'rule_based_demo'}
                </span>
              </div>

              {parsedResult.fileName && (
                <p className="text-xs text-slate-500">
                  File: <span className="font-semibold text-slate-800">{parsedResult.fileName}</span>
                  {parsedResult.resumeId || parsedResult.id
                    ? ` · ID #${parsedResult.resumeId || parsedResult.id}`
                    : ''}
                </p>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Detected Skills ({skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 && (
                    <p className="text-xs text-slate-400">No dictionary skills matched.</p>
                  )}
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 px-3 py-1 rounded-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {parsedResult.education?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Education
                  </h4>
                  <div className="p-3.5 bg-slate-50 rounded-2xl text-xs border border-slate-100">
                    <p className="font-bold text-slate-900 whitespace-pre-wrap">
                      {typeof parsedResult.education[0] === 'object'
                        ? parsedResult.education[0].degree
                        : parsedResult.education[0]}
                    </p>
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Projects
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {projects.slice(0, 5).map((p, i) => (
                      <li
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                    {suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/interview-setup')}
                  icon={ArrowRight}
                  className="shimmer-effect"
                >
                  Continue to Interview Setup
                </Button>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No Resume Analyzed Yet</p>
              <p className="text-xs mt-1">
                Upload a PDF or DOCX file to extract skills from the backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
