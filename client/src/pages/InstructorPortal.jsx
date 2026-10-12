import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  FileCheck,
  Trophy,
  Trash2,
  Edit3,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { problemService } from '../services/problemService';
import { assessmentService } from '../services/assessmentService';
import { contestService } from '../services/contestService';
import DifficultyBadge from '../components/DifficultyBadge';

export default function InstructorPortal() {
  const [activeTab, setActiveTab] = useState('problems'); // 'problems' | 'create-problem' | 'assessments' | 'create-assessment'

  // Problems state
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // New Problem Form state
  const [problemForm, setProblemForm] = useState({
    title: '',
    difficulty: 'Easy',
    description: '',
    topics: 'Arrays, Hashing',
    tags: 'Array, Hash Table',
    constraints: '1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
    inputFormat: 'Line 1: N\nLine 2: N space-separated integers',
    outputFormat: 'Single integer answer',
    hints: 'Consider using a hash table for O(N) lookup.',
    editorial: '### Optimal Approach\nWe can use a hash map to achieve linear time complexity.',
    testCases: [
      { input: '4\n2 7 11 15', expectedOutput: '9', isPublic: true },
      { input: '5\n1 2 3 4 5', expectedOutput: '15', isPublic: false },
    ],
    starterCode: {
      javascript: `const fs = require('fs');\n\nfunction solve() {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  // Solution\n  console.log("0");\n}\n\nsolve();`,
      python: `import sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    print("0")\n\nif __name__ == '__main__':\n    solve()`,
    },
  });

  // Assessments state
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  // New Assessment Form state
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    code: '',
    duration: 60,
    passingScore: 65,
    candidateEmails: '',
    selectedProblemIds: [],
  });

  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Fetch problems
  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const res = await problemService.getProblems({ limit: 100 });
      if (res.success) setProblems(res.problems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Fetch assessments
  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await assessmentService.getInstructorAssessments();
      if (res.success) setAssessments(res.assessments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchAssessments();
  }, []);

  // Add / Remove Test Case in Form
  const handleAddTestCase = (isPublic = true) => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isPublic }],
    }));
  };

  const handleRemoveTestCase = (index) => {
    setProblemForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, idx) => idx !== index),
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setProblemForm((prev) => {
      const updated = [...prev.testCases];
      updated[index][field] = value;
      return { ...prev, testCases: updated };
    });
  };

  // Submit New Problem
  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: problemForm.title,
        difficulty: problemForm.difficulty,
        description: problemForm.description,
        topics: problemForm.topics.split(',').map((s) => s.trim()).filter(Boolean),
        tags: problemForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
        constraints: problemForm.constraints.split('\n').filter(Boolean),
        inputFormat: problemForm.inputFormat,
        outputFormat: problemForm.outputFormat,
        hints: problemForm.hints.split('\n').filter(Boolean),
        editorial: problemForm.editorial,
        starterCode: problemForm.starterCode,
        testCases: problemForm.testCases,
      };

      const res = await problemService.createProblem(payload);
      if (res.success) {
        alert('Problem published successfully!');
        fetchProblems();
        setActiveTab('problems');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create problem.');
    }
  };

  // Delete problem
  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await problemService.deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete problem.');
    }
  };

  // Submit New Assessment
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (assessmentForm.selectedProblemIds.length === 0) {
      alert('Please select at least one problem for this assessment.');
      return;
    }

    try {
      const payload = {
        title: assessmentForm.title,
        code: assessmentForm.code.toUpperCase().trim(),
        duration: Number(assessmentForm.duration),
        passingScore: Number(assessmentForm.passingScore),
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 86400000), // Active for 30 days
        problems: assessmentForm.selectedProblemIds.map((id) => ({
          problem: id,
          points: 100,
        })),
        candidateEmails: assessmentForm.candidateEmails
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean),
      };

      const res = await assessmentService.createAssessment(payload);
      if (res.success) {
        alert('Assessment created successfully!');
        fetchAssessments();
        setActiveTab('assessments');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create assessment.');
    }
  };

  // View assessment analytics
  const handleViewAnalytics = async (id) => {
    try {
      setSelectedAssessmentId(id);
      const res = await assessmentService.getAnalytics(id);
      if (res.success) {
        setAnalyticsData(res.analytics);
      }
    } catch (err) {
      alert('Failed to load assessment analytics');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            Instructor Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author coding problems, configure hidden test suites, and manage candidate evaluations.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'problems'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            Problem Library
          </button>
          <button
            onClick={() => setActiveTab('create-problem')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'create-problem'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Problem
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'assessments'
                ? 'bg-teal-400 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setActiveTab('create-assessment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'create-assessment'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* 1. Problem List Tab */}
      {activeTab === 'problems' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-4">Manage Coding Problems</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Topics</th>
                  <th className="px-4 py-3 text-right">Submissions</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {problems.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-200">{p.title}</td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {(p.topics || []).slice(0, 3).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {p.totalSubmissions || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProblem(p._id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Create Problem Form Tab */}
      {activeTab === 'create-problem' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Create New Coding Problem</h2>
          <form onSubmit={handleCreateProblem} className="space-y-6 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                  placeholder="e.g. Invert Binary Tree"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Difficulty</label>
                <select
                  value={problemForm.difficulty}
                  onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Problem Description (Markdown)
              </label>
              <textarea
                rows={5}
                required
                value={problemForm.description}
                onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                placeholder="Detailed problem statement..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Topics (Comma-separated)
                </label>
                <input
                  type="text"
                  value={problemForm.topics}
                  onChange={(e) => setProblemForm({ ...problemForm, topics: e.target.value })}
                  placeholder="Arrays, Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={problemForm.tags}
                  onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                  placeholder="Hash Table, Array"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Constraints</label>
              <textarea
                rows={2}
                value={problemForm.constraints}
                onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono"
              />
            </div>

            {/* Test Cases Editor (Public vs Hidden) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Test Case Configuration</h3>
                  <p className="text-slate-400 text-[11px]">
                    Define public sample test cases (visible to candidates) and hidden test cases (sandbox only).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddTestCase(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    + Public Test Case
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddTestCase(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg text-xs flex items-center gap-1"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    + Hidden Test Case
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {problemForm.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-3"
                  >
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        tc.isPublic
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tc.isPublic ? 'Public' : 'Hidden'} #{idx + 1}
                    </span>

                    <div className="flex-1 w-full grid sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="Stdin input"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                      />
                      <input
                        type="text"
                        required
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        placeholder="Expected stdout output"
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Publish Coding Problem
            </button>
          </form>
        </div>
      )}

      {/* 3. Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-4">Instructor Assessments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Assessment Title</th>
                    <th className="px-4 py-3">Access Code</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Candidates</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3 text-right">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assessments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-200">{a.title}</td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-400">{a.code}</td>
                      <td className="px-4 py-3 text-slate-400">{a.duration} mins</td>
                      <td className="px-4 py-3 text-slate-300">{a.totalCandidates}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{a.completedCount}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewAnalytics(a._id)}
                          className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold rounded-lg"
                        >
                          View Analytics
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics View */}
          {analyticsData && (
            <div className="bg-slate-900/60 border border-teal-500/30 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-4">Assessment Candidate Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Candidates</div>
                  <div className="text-xl font-bold text-white mt-1">{analyticsData.totalInvited}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Completion Rate</div>
                  <div className="text-xl font-bold text-teal-400 mt-1">{analyticsData.completionRate}%</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Pass Rate</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{analyticsData.passRate}%</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Average Score</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{analyticsData.averageScore} pts</div>
                </div>
              </div>

              {/* Candidates List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Candidate Email</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Score</th>
                      <th className="px-3 py-2 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {analyticsData.candidatesList?.map((c, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2.5 font-medium text-slate-200">{c.email}</td>
                        <td className="px-3 py-2.5 text-slate-400 uppercase text-[10px]">{c.status}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white">{c.score || 0}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={`font-semibold ${
                              c.passed ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {c.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Create Assessment Tab */}
      {activeTab === 'create-assessment' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Create Technical Assessment</h2>
          <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assessment Title</label>
              <input
                type="text"
                required
                value={assessmentForm.title}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer Coding Assessment"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Access Code</label>
                <input
                  type="text"
                  required
                  value={assessmentForm.code}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. REACT-LEAD-2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={assessmentForm.duration}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, duration: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  required
                  value={assessmentForm.passingScore}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, passingScore: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Candidate Emails (Comma-separated)
              </label>
              <input
                type="text"
                value={assessmentForm.candidateEmails}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, candidateEmails: e.target.value })}
                placeholder="candidate1@example.com, candidate2@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
              />
            </div>

            {/* Select Problems */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Select Assessment Problems ({assessmentForm.selectedProblemIds.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                {problems.map((p) => {
                  const isSelected = assessmentForm.selectedProblemIds.includes(p._id);
                  return (
                    <label
                      key={p._id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setAssessmentForm({
                              ...assessmentForm,
                              selectedProblemIds: assessmentForm.selectedProblemIds.filter(
                                (id) => id !== p._id
                              ),
                            });
                          } else {
                            setAssessmentForm({
                              ...assessmentForm,
                              selectedProblemIds: [...assessmentForm.selectedProblemIds, p._id],
                            });
                          }
                        }}
                        className="rounded border-slate-700 text-teal-500 focus:ring-0"
                      />
                      <span className="text-slate-200 flex-1">{p.title}</span>
                      <DifficultyBadge difficulty={p.difficulty} size="xs" />
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Generate Technical Assessment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
