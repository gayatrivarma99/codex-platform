import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: false, msg: '', token: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ success: false, msg: '', token: '' });

    try {
      const res = await authService.forgotPassword(email);
      setStatus({
        success: true,
        msg: 'Password reset link generated successfully.',
        token: res.resetToken,
      });
    } catch (err) {
      setStatus({
        success: false,
        msg: err.response?.data?.error || 'Failed to request reset.',
        token: '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your email to receive a password reset token
          </p>
        </div>

        {status.msg && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex flex-col gap-2 ${
              status.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {status.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.msg}</span>
            </div>
            {status.token && (
              <div className="mt-2 pt-2 border-t border-emerald-500/20">
                <span className="text-[11px] block font-semibold">Development Direct Reset Link:</span>
                <Link
                  to={`/reset-password/${status.token}`}
                  className="text-[11px] text-emerald-400 underline font-mono break-all mt-1 inline-block"
                >
                  Click here to set new password
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@codex.dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Remember password?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
