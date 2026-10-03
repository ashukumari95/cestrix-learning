import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Auto-detect role from backend if it matches, or you can enforce checking here.
      // E.g. if (response.data.user.role !== selectedRole) throw Error("Invalid role")
      
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #001233 0%, #001845 50%, #000f28 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle, #1a5dc9, transparent)' }} />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #cc2529, transparent)' }} />
      <div className="absolute top-1/3 right-0 w-[250px] h-[250px] rounded-full blur-[90px] pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #f5a623, transparent)' }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(157,188,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(157,188,238,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #f5a623 0%, #cc2529 50%, #1a5dc9 100%)' }} />

      <div className="relative z-10 w-full max-w-[390px] mx-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(26,93,201,0.2)', border: '1px solid rgba(26,93,201,0.4)', color: '#9dbcee' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Cestrix ERP · v1.0.0
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center relative overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(26,93,201,0.5)' }}>
            <div className="absolute inset-0" style={{ background: '#001845' }} />
            <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: '#f5a623' }} />
            <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: '20px solid transparent', borderTop: '20px solid #cc2529' }} />
            <span className="relative z-10 text-2xl font-black text-white">CX</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cestrix Learning</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(157,188,238,0.6)' }}>
            Coaching Management Platform
          </p>
        </div>

        <div className="rounded-2xl p-6 space-y-3"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(26,93,201,0.2)' }}>
          
          {!selectedRole ? (
            <>
              <p className="text-[10px] font-bold mb-4 text-center tracking-widest uppercase"
                style={{ color: 'rgba(157,188,238,0.4)' }}>Select Your Workspace</p>

              <button onClick={() => setSelectedRole('COACHING_ADMIN')}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 20px rgba(26,93,201,0.5)' }}>
                🏫 Coaching Admin Panel
              </button>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <button onClick={() => setSelectedRole('STUDENT')}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,188,238,0.15)', color: '#c5d7f5' }}>
                  👨‍🎓 Student
                </button>
                <button onClick={() => setSelectedRole('TEACHER')}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,188,238,0.15)', color: '#c5d7f5' }}>
                  👨‍🏫 Teacher
                </button>
                <button onClick={() => setSelectedRole('PARENT')}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(157,188,238,0.15)', color: '#c5d7f5' }}>
                  👨‍👩‍👦 Parent
                </button>
              </div>

              <button onClick={() => setSelectedRole('SUPER_ADMIN')}
                className="w-full mt-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:text-white"
                style={{ color: 'rgba(157,188,238,0.35)' }}>
                Super Admin →
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-center tracking-widest uppercase"
                  style={{ color: 'rgba(157,188,238,0.4)' }}>
                  {selectedRole.replace('_', ' ')} LOGIN
                </p>
                <button type="button" onClick={() => setSelectedRole(null)} className="text-xs text-blue-400 hover:text-blue-300">
                  ← Back
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-blue-200 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-900/50 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={
                    selectedRole === 'COACHING_ADMIN' ? "admin@brilliantphysics.com" :
                    selectedRole === 'TEACHER' ? "teacher@brilliantphysics.com" : 
                    selectedRole === 'STUDENT' ? "student@example.com" :
                    "parent@email.com"
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-blue-200">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-900/50 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 20px rgba(26,93,201,0.5)' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        <div className="flex h-1 rounded-full mt-6 overflow-hidden mx-8">
          <div className="flex-1" style={{ background: '#f5a623' }} />
          <div className="flex-1" style={{ background: '#cc2529' }} />
          <div className="flex-1" style={{ background: '#1a5dc9' }} />
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: 'rgba(157,188,238,0.25)' }}>
          © 2025 Cestrix Learning Technologies
        </p>
      </div>
    </div>
  );
};
