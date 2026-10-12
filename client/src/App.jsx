import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import ContestList from './pages/ContestList';
import ContestDetail from './pages/ContestDetail';
import AssessmentList from './pages/AssessmentList';
import AssessmentArena from './pages/AssessmentArena';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import InstructorPortal from './pages/InstructorPortal';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/problems" element={<ProblemList />} />
                  <Route path="/problems/:slug" element={<ProblemDetail />} />
                  <Route path="/contests" element={<ContestList />} />
                  <Route path="/contests/:slug" element={<ContestDetail />} />
                  <Route path="/assessments" element={<AssessmentList />} />
                  <Route
                    path="/assessments/arena/:code"
                    element={
                      <ProtectedRoute>
                        <AssessmentArena />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile/:username" element={<Profile />} />

                  {/* Protected Student Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Instructor Portal */}
                  <Route
                    path="/instructor"
                    element={
                      <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                        <InstructorPortal />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
