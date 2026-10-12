import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  HelpCircle,
  FileText,
  History,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';

export default function ProblemDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const assessmentId = searchParams.get('assessmentId');

  const { isAuthenticated, refreshUser } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Left panel active tab: 'description' | 'editorial' | 'hints' | 'submissions'
  const [leftTab, setLeftTab] = useState('description');

  // Code editor states
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  // Bottom console states
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'run' | 'submit'
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // User's previous submissions on this problem
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Fetch Problem
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await problemService.getProblemBySlug(slug);
        if (res.success && res.problem) {
          setProblem(res.problem);
          // Set initial code for language
          const starter = res.problem.starterCode?.[language] || getDefaultStarter(language);
          setCode(starter);

          // Set default custom input from first testcase if available
          if (res.problem.testCases?.length > 0) {
            setCustomInput(res.problem.testCases[0].input || '');
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  // Load starter code when language switches
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    } else {
      setCode(getDefaultStarter(newLang));
    }
  };

  const handleResetCode = () => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode(getDefaultStarter(language));
    }
  };

  function getDefaultStarter(lang) {
    if (lang === 'python') {
      return `import sys\n\ndef solve():\n    input_data = sys.stdin.read().strip()\n    # Write your solution here\n    print("solution")\n\nif __name__ == '__main__':\n    solve()`;
    }
    if (lang === 'cpp') {
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`;
    }
    if (lang === 'java') {
      return `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}`;
    }
    return `const fs = require('fs');\n\nfunction solve() {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  // Write your solution here\n  console.log("solution");\n}\n\nsolve();`;
  }

  // Fetch user submission history for this problem
  const fetchMySubmissions = async () => {
    if (!isAuthenticated || !problem) return;
    setLoadingSubmissions(true);
    try {
      const res = await submissionService.getMySubmissions({ problemId: problem._id });
      if (res.success) {
        setUserSubmissions(res.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (leftTab === 'submissions') {
      fetchMySubmissions();
    }
  }, [leftTab, problem]);

  // Run Code
  const handleRunCode = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to test run code.');
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('run');

    try {
      const payload = {
        problemId: problem._id,
        language,
        code,
        customInput: isCustom ? customInput : undefined,
      };

      const res = await submissionService.runCode(payload);
      if (res.success) {
        setRunResult(res.result);
      }
    } catch (err) {
      setRunResult({
        status: 'Runtime Error',
        error: err.response?.data?.error || 'Failed to execute code.',
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to submit your solution.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('submit');

    try {
      const payload = {
        problemId: problem._id,
        language,
        code,
        contestId: contestId || undefined,
        assessmentId: assessmentId || undefined,
      };

      const res = await submissionService.submitCode(payload);
      if (res.success) {
        setSubmissionResult(res.submission);
        refreshUser(); // Refresh user profile streaks & solved count
      }
    } catch (err) {
      setSubmissionResult({
        status: 'Runtime Error',
        error: err.response?.data?.error || 'Failed to submit solution.',
        testCasesPassed: 0,
        totalTestCases: problem.testCases?.length || 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading problem arena...</span>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Problem Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Unable to locate this coding problem.'}</p>
        <Link
          to="/problems"
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Return to Problem Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Top Banner (If contest or assessment active) */}
      {(contestId || assessmentId) && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
          <span className="font-semibold">
            {contestId ? '⚔️ Contest Arena Mode Active' : '📋 Candidate Assessment Mode Active'}
          </span>
          <span className="text-[11px] opacity-80">Submissions will be scored toward event leaderboard</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ================= LEFT SIDE: Problem Workspace ================= */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40 overflow-hidden">
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeftTab('description')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  leftTab === 'description'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Description
              </button>

              <button
                onClick={() => setLeftTab('editorial')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  leftTab === 'editorial'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Editorial
              </button>

              <button
                onClick={() => setLeftTab('hints')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  leftTab === 'hints'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Hints {problem.hints?.length > 0 && `(${problem.hints.length})`}
              </button>

              <button
                onClick={() => setLeftTab('submissions')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  leftTab === 'submissions'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Submissions
              </button>
            </div>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {leftTab === 'description' && (
              <>
                {/* Title & Metadata */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      {problem.title}
                    </h1>
                    <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                    {problem.isSolved && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span>Acceptance Rate: <strong className="text-slate-200">{problem.acceptanceRate || 0}%</strong></span>
                    <span>Submissions: <strong className="text-slate-200">{problem.totalSubmissions || 0}</strong></span>
                    <span>Time Limit: <strong className="text-slate-200">{problem.timeLimit || 2000} ms</strong></span>
                  </div>

                  {/* Topics & Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {problem.topics?.map((top, idx) => (
                      <span key={idx} className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md">
                        {top}
                      </span>
                    ))}
                    {problem.tags?.map((tag, idx) => (
                      <span key={idx} className="text-[11px] bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Problem Description Body */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-800/80 pt-4 font-sans">
                  {problem.description}
                </div>

                {/* Examples */}
                {problem.examples?.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Examples
                    </h3>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2 font-mono"
                      >
                        <div className="text-slate-400 font-sans font-semibold">Example {idx + 1}:</div>
                        <div>
                          <span className="text-slate-400 font-sans">Input: </span>
                          <span className="text-slate-200 whitespace-pre-wrap">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans">Output: </span>
                          <span className="text-emerald-400 whitespace-pre-wrap">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-800/60">
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Constraints
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx} className="text-slate-300">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Editorial Tab */}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white">Solution Editorial</h2>
                {problem.editorial ? (
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    {problem.editorial}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">
                    Official editorial will be released after contest conclusion.
                  </div>
                )}
              </div>
            )}

            {/* Hints Tab */}
            {leftTab === 'hints' && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white mb-2">Hints & Guiding Questions</h2>
                {problem.hints?.length > 0 ? (
                  problem.hints.map((hint, idx) => (
                    <details
                      key={idx}
                      className="group bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300"
                    >
                      <summary className="font-semibold cursor-pointer text-emerald-400 flex items-center justify-between">
                        <span>Hint {idx + 1}</span>
                        <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-slate-300 text-xs pt-2 border-t border-slate-800">
                        {hint}
                      </p>
                    </details>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No hints available for this problem.</p>
                )}
              </div>
            )}

            {/* Submissions History Tab */}
            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white">Your Past Submissions</h2>
                {loadingSubmissions ? (
                  <p className="text-xs text-slate-400 py-4">Loading past submissions...</p>
                ) : userSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    You haven't submitted any code for this problem yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userSubmissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span
                            className={`font-semibold ${
                              sub.status === 'Accepted'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {sub.status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(sub.submittedAt).toLocaleString()} • {sub.language}
                          </div>
                        </div>

                        <div className="text-right text-[11px] font-mono text-slate-300">
                          <div>{sub.executionTime} ms</div>
                          <div className="text-slate-400 text-[10px]">
                            {sub.testCasesPassed} / {sub.totalTestCases} passed
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT SIDE: Code Editor & Console ================= */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2">
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (g++)</option>
                <option value="java">Java (JDK)</option>
              </select>

              {/* Theme Selector */}
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none"
              >
                <option value="vs-dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                title="Reset to starter code"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Evaluating...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language}
              value={code}
              theme={editorTheme}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* ================= BOTTOM CONSOLE ================= */}
          <div
            className={`border-t border-slate-800 bg-slate-900/95 transition-all flex flex-col ${
              consoleOpen ? 'h-64 sm:h-72' : 'h-10'
            }`}
          >
            {/* Console Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-1.5 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setConsoleOpen(true);
                    setActiveConsoleTab('testcases');
                  }}
                  className={`text-xs font-semibold py-1 px-2 rounded-lg transition-colors ${
                    activeConsoleTab === 'testcases' && consoleOpen
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases
                </button>

                <button
                  onClick={() => {
                    setConsoleOpen(true);
                    setActiveConsoleTab('run');
                  }}
                  className={`text-xs font-semibold py-1 px-2 rounded-lg transition-colors ${
                    activeConsoleTab === 'run' && consoleOpen
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Run Result
                </button>

                <button
                  onClick={() => {
                    setConsoleOpen(true);
                    setActiveConsoleTab('submit');
                  }}
                  className={`text-xs font-semibold py-1 px-2 rounded-lg transition-colors ${
                    activeConsoleTab === 'submit' && consoleOpen
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Submission Result
                </button>
              </div>

              <button
                onClick={() => setConsoleOpen(!consoleOpen)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {consoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Console Content */}
            {consoleOpen && (
              <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
                {/* 1. Test Cases Tab */}
                {activeConsoleTab === 'testcases' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {(problem.testCases || []).map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedTestCaseIdx(idx);
                            setIsCustom(false);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            selectedTestCaseIdx === idx && !isCustom
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setIsCustom(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isCustom
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Custom Input
                      </button>
                    </div>

                    {!isCustom ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 font-sans block mb-1">Standard Input:</span>
                          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap">
                            {problem.testCases?.[selectedTestCaseIdx]?.input || '(Empty input)'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block mb-1">Expected Output:</span>
                          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 whitespace-pre-wrap">
                            {problem.testCases?.[selectedTestCaseIdx]?.expectedOutput || ''}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 font-sans block mb-1">Custom Stdin:</span>
                        <textarea
                          rows={4}
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter standard input..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Run Result Tab */}
                {activeConsoleTab === 'run' && (
                  <div>
                    {!runResult ? (
                      <div className="text-center py-6 text-slate-400">
                        Hit "Run Code" to test solution against sample input.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              runResult.status === 'Accepted' || runResult.status === 'Success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {runResult.status}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            {runResult.executionTime} ms
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Cpu className="w-3.5 h-3.5" />
                            {runResult.memoryUsed || 18} MB
                          </span>
                        </div>

                        {runResult.error && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl whitespace-pre-wrap">
                            {runResult.error}
                          </div>
                        )}

                        {runResult.results?.map((res, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-slate-400 font-sans">
                              <span>Test Case {idx + 1}</span>
                              <span className={res.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {res.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px]">Input: </span>
                              <pre className="text-slate-200 mt-0.5">{res.input}</pre>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px]">Expected Output: </span>
                              <pre className="text-emerald-400 mt-0.5">{res.expectedOutput}</pre>
                            </div>
                            <div>
                              <span className="text-slate-400 font-sans text-[11px]">Actual Output: </span>
                              <pre className="text-slate-200 mt-0.5">{res.actualOutput}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Submission Result Tab */}
                {activeConsoleTab === 'submit' && (
                  <div>
                    {!submissionResult ? (
                      <div className="text-center py-6 text-slate-400">
                        Click "Submit" to execute against hidden test cases.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              submissionResult.status === 'Accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {submissionResult.status}
                          </span>
                          <span className="text-slate-300 text-xs font-semibold">
                            {submissionResult.testCasesPassed} / {submissionResult.totalTestCases} Test Cases Passed
                          </span>
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {submissionResult.executionTime} ms
                          </span>
                        </div>

                        {/* Test Cases Results List */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                          {submissionResult.results?.map((r, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border text-center text-xs ${
                                r.passed
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                              }`}
                            >
                              <div className="font-semibold">Case #{idx + 1}</div>
                              <div className="text-[10px] mt-0.5">{r.status}</div>
                              <div className="text-[9px] opacity-70 mt-0.5">{r.executionTime || 0} ms</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
