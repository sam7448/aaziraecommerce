import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate/handle password reset request
    try {
      // In Supabase client or backend auth service
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={sent ? undefined : "Enter your email address and we'll send you recovery instructions."}
    >
      {sent ? (
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800">Check your inbox</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              We have sent password recovery instructions to{' '}
              <span className="font-medium text-slate-700">{email}</span>.
            </p>
          </div>
          <div className="pt-4 w-full space-y-2">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#FFE08B] hover:bg-[#F3D274] text-slate-950 font-bold border border-[#F2D070] rounded-xl text-sm transition-all shadow-sm"
            >
              Return to Sign In
            </Link>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-800 py-1"
            >
              Didn't receive an email? Try again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFE08B] focus:border-[#FFE08B] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#FFE08B] hover:bg-[#F3D274] disabled:opacity-50 text-slate-950 font-bold border border-[#F2D070] rounded-xl text-sm transition-all shadow-sm mt-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
            {loading ? 'Sending link…' : 'Send Reset Link'}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-amber-800 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
