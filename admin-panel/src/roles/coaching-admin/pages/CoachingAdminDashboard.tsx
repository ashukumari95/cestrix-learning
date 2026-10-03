import React from 'react';
import {
  Users, GraduationCap, BookOpen, IndianRupee, TrendingUp, TrendingDown,
  ArrowRight, CalendarCheck, AlertTriangle, Bot, FileText, ChevronRight,
  Clock, Star, Layers, Activity, Zap, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../api';

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({
  label, value, sub, icon: Icon, gradient, glowColor, trend, trendUp
}: {
  label: string; value: string; sub?: string; icon: any;
  gradient: string; glowColor: string; trend?: string; trendUp?: boolean;
}) => (
  <div className="cx-card cx-animate-in relative overflow-hidden p-5 flex flex-col gap-3 group cursor-default">
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] transition-transform duration-300 group-hover:scale-125"
      style={{ background: glowColor }} />

    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ background: gradient, boxShadow: `0 4px 12px ${glowColor}55` }}>
        <Icon size={18} color="white" strokeWidth={2.5} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${
          trendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </span>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1 leading-tight">{sub}</p>}
    </div>
  </div>
);

// ── Risk colors ────────────────────────────────────────────────────────────
const RISK: Record<string, string> = {
  HIGH:   'bg-red-50 text-red-700 border-red-100',
  MEDIUM: 'bg-orange-50 text-orange-700 border-orange-100',
  LOW:    'bg-yellow-50 text-yellow-700 border-yellow-100',
};

// ── GMR rank colors ──────────────────────────────────────────────────────
const rankStyle = (r: number) => {
  if (r === 1) return { background: 'linear-gradient(135deg,#f5a623,#d97706)', color: 'white' };
  if (r === 2) return { background: 'linear-gradient(135deg,#9ca3af,#d1d5db)', color: 'white' };
  if (r === 3) return { background: 'linear-gradient(135deg,#cc2529,#a81e22)', color: 'white' };
  return { background: '#e8f0fb', color: '#1a5dc9' };
};

import { useAuth } from '../../../context/AuthContext';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const CoachingAdminDashboard = () => {
  const { user } = useAuth();
  
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    totalCourses: 0,
    batches: [] as any[],
    todayAttendancePct: 0,
    presentCount: 0,
    absentCount: 0,
    pendingFees: 0,
    monthlyRevenue: 0,
    upcomingTests: [] as any[],
    topStudents: [] as any[],
    atRisk: [] as any[],
    aiDoubts: [] as any[],
    activities: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/coaching/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">

      {/* ── Header ── */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            <span className="text-xs font-medium text-gray-400">{now}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>
            {greeting}, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's your coaching snapshot for today.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="cx-btn-secondary text-xs">
            <BarChart3 size={14} /> Generate Report
          </button>
          <Link to="students/add" className="cx-btn-primary text-xs">
            <Zap size={14} /> New Student
          </Link>
        </div>
      </div>

      {/* ── KPI Row — GMR palette ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Students"     value={stats.totalStudents.toString()}  icon={Users}         gradient="linear-gradient(135deg,#1a5dc9,#0e3578)"  glowColor="#1a5dc9" />
        <KpiCard label="Active Teachers"    value={stats.activeTeachers.toString()} icon={GraduationCap} gradient="linear-gradient(135deg,#f5a623,#d97706)"  glowColor="#f5a623" />
        <KpiCard label="Total Courses"      value={stats.totalCourses.toString()}   icon={BookOpen}      gradient="linear-gradient(135deg,#0891b2,#0e7490)"  glowColor="#0891b2" />
        <KpiCard label="Today's Attendance" value={`${stats.todayAttendancePct}%`}  icon={CalendarCheck} gradient="linear-gradient(135deg,#059669,#047857)"  glowColor="#059669" />
        <KpiCard label="Pending Fees"       value={`₹${stats.pendingFees.toLocaleString()}`} icon={IndianRupee}   gradient="linear-gradient(135deg,#cc2529,#a81e22)"  glowColor="#cc2529" />
        <KpiCard label="Monthly Revenue"    value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp}    gradient="linear-gradient(135deg,#059669,#065f46)"  glowColor="#059669" />
      </div>

      {/* ── Quick Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* At Risk */}
        <div className="cx-card cx-animate-in-2 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <AlertTriangle size={16} className="text-red-600" /> Students At Risk
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
              {stats.atRisk.length} Alerts
            </span>
          </div>
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[10px] text-gray-400 mb-3">Early warning: attendance + score drops</p>
            {stats.atRisk.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                style={{ background: '#f0f4fa', border: '1px solid #dce8f7' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#cc2529,#f97316)' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: '#0d1b3e' }}>{s.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{s.batch} · {s.reason}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ml-2 ${RISK[s.level]}`}>
                  {s.level}
                </span>
              </div>
            ))}
            <button className="w-full pt-2 text-xs font-semibold flex items-center justify-center gap-1" style={{ color: '#1a5dc9' }}>
              View All At-Risk <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* AI Doubts */}
        <div className="cx-card cx-animate-in-2 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <Bot size={16} style={{ color: '#1a5dc9' }} /> AI Doubts Escalated
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full border"
              style={{ background: '#e8f0fb', color: '#1448a0', borderColor: '#9dbcee' }}>
              {stats.aiDoubts.length} Pending
            </span>
          </div>
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[10px] text-gray-400 mb-3">Doubts AI couldn't resolve — need teacher</p>
            {stats.aiDoubts.map((d: any, i: number) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-xl cursor-pointer"
                style={{ background: '#e8f0fb', border: '1px solid #9dbcee' }}>
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-xs font-semibold truncate" style={{ color: '#0d1b3e' }}>{d.q}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{d.student} · {d.ago} ago</p>
                </div>
                <button className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg text-white"
                  style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)' }}>
                  Resolve
                </button>
              </div>
            ))}
            <Link to="ai-management" className="w-full pt-2 text-xs font-semibold flex items-center justify-center gap-1" style={{ color: '#1a5dc9' }}>
              Open AI Management <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="cx-card cx-animate-in-2 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <FileText size={16} style={{ color: '#f5a623' }} /> Upcoming Tests
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              {stats.upcomingTests.length} upcoming
            </span>
          </div>
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[10px] text-gray-400 mb-3">Scheduled across all active batches</p>
            {stats.upcomingTests.map((t: any, i: number) => (
              <div key={i} className="p-3 rounded-xl cursor-pointer"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-bold flex-1 truncate" style={{ color: '#0d1b3e' }}>{t.name}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ background: '#fde68a', color: '#92400e' }}>{t.type}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{t.batch}</p>
                <p className="text-[10px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                  <Clock size={10} /> {t.when}
                </p>
              </div>
            ))}
            <Link to="tests" className="w-full pt-2 text-xs font-semibold flex items-center justify-center gap-1" style={{ color: '#1a5dc9' }}>
              Manage All Tests <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

        {/* Attendance Ring — GMR deep navy */}
        <div className="cx-card cx-animate-in-3 relative overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(160deg,#001233 0%,#001845 100%)', border: '1px solid rgba(26,93,201,0.3)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(26,93,201,0.25) 0%, transparent 70%)', transform: 'translate(40%, -40%)' }} />
          {/* gold top stripe */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #f5a623, #cc2529, #1a5dc9)' }} />

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck size={15} style={{ color: '#9dbcee' }} /> Today's Attendance
              </h3>
              <span className="text-[10px] px-2 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(26,93,201,0.35)', color: '#9dbcee' }}>Live</span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
                  <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
                  <circle cx="65" cy="65" r="55" fill="none"
                    stroke="url(#attGradGMR)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 55}`}
                    strokeDashoffset={`${2 * Math.PI * 55 * (1 - 0.92)}`}
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="attGradGMR" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f5a623" />
                      <stop offset="50%" stopColor="#cc2529" />
                      <stop offset="100%" stopColor="#1a5dc9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{stats.todayAttendancePct}%</span>
                  <span className="text-[10px]" style={{ color: '#9dbcee' }}>present</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.25)' }}>
                <p className="text-lg font-black text-emerald-400">{stats.presentCount}</p>
                <p className="text-[10px]" style={{ color: 'rgba(110,231,183,0.7)' }}>Present</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(204,37,41,0.15)', border: '1px solid rgba(204,37,41,0.25)' }}>
                <p className="text-lg font-black text-red-400">{stats.absentCount}</p>
                <p className="text-[10px]" style={{ color: 'rgba(252,165,165,0.7)' }}>Absent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="cx-card cx-animate-in-3 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b" style={{ borderColor: '#dce8f7' }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <Activity size={15} style={{ color: '#1a5dc9' }} /> Recent Activity
            </h3>
            <button className="text-xs font-semibold" style={{ color: '#1a5dc9' }}>All</button>
          </div>
          <div className="p-5 space-y-3">
            {stats.activities.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex flex-col items-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: a.dot }} />
                  {i < stats.activities.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: '#dce8f7', minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-xs font-semibold leading-tight truncate" style={{ color: '#0d1b3e' }}>{a.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.sub} · {a.ago} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Batch Fill Rates */}
        <div className="cx-card cx-animate-in-3 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b" style={{ borderColor: '#dce8f7' }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <Layers size={15} style={{ color: '#1a5dc9' }} /> Batch Overview
            </h3>
            <Link to="batches" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#1a5dc9' }}>
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {stats.batches.map((b, i) => {
              const pct = b.cap > 0 ? Math.round((b.enrolled / b.cap) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold truncate flex-1" style={{ color: '#0d1b3e' }}>{b.name}</p>
                    <p className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: pct >= 90 ? '#cc2529' : '#6b7280' }}>
                      {b.enrolled}/{b.cap}
                    </p>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct >= 90 ? '#cc2529' : b.color }} />
                  </div>
                  <p className="text-[10px] text-right mt-0.5 text-gray-400">{pct}% full</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="cx-card cx-animate-in-3 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b" style={{ borderColor: '#dce8f7' }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0d1b3e' }}>
              <Star size={15} style={{ color: '#f5a623' }} /> Top Performers
            </h3>
            <Link to="results" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#1a5dc9' }}>
              Results <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {stats.topStudents.map((s: any) => (
              <div key={s.rank} className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/60 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={rankStyle(s.rank)}>
                  {s.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#0d1b3e' }}>{s.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{s.batch}</p>
                </div>
                <span className="text-xs font-black flex-shrink-0" style={{ color: '#059669' }}>{s.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
