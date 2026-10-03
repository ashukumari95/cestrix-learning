import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a192f] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 w-full max-w-md bg-[#112240]/80 backdrop-blur-2xl rounded-3xl p-8 border border-blue-900/50 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
            <span className="text-2xl font-black text-white tracking-tighter">CX</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-center" style={{ color: 'rgba(157,188,238,0.7)' }}>
            {!submitted ? 'Enter your email to receive a reset link.' : 'Check your inbox for instructions.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-xs font-medium text-blue-200 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-900/50 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="account@example.com"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 20px rgba(26,93,201,0.5)' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-xs text-blue-400 hover:text-blue-300">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <span className="text-emerald-400 text-2xl">✓</span>
            </div>
            <p className="text-sm text-white mb-6">
              We've sent a password reset link to <br/>
              <span className="font-semibold text-blue-300">{email}</span>
            </p>
            <button 
              onClick={() => navigate('/reset-password', { state: { email } })}
              className="w-full inline-block py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:bg-white/10 border border-white/20 mb-3">
              Enter Reset Code
            </button>
            <Link to="/login"
              className="text-xs text-blue-400 hover:text-blue-300">
              Return to Sign In
            </Link>
          </div>
        )}

        <div className="flex h-1 rounded-full mt-8 overflow-hidden mx-8">
          <div className="flex-1" style={{ background: '#f5a623' }} />
          <div className="flex-1" style={{ background: '#cc2529' }} />
          <div className="flex-1" style={{ background: '#1a5dc9' }} />
        </div>
      </div>
    </div>
  );
};
