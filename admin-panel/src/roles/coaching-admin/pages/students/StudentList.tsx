import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Edit, Eye, MessageSquare,
  ChevronLeft, ChevronRight, Download, Users, TrendingUp,
  IndianRupee, CalendarCheck, X, ChevronDown, Phone, Zap, Upload
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  phone: string;
  photo?: string;
  initials: string;
  class: string;
  board: string;
  batch: string;
  targetExam: 'JEE' | 'NEET' | 'BOARD' | 'FOUNDATION';
  mode: 'OFFLINE' | 'ONLINE' | 'HYBRID';
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'SUSPENDED';
  attendance: number;       // percentage
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  feeDue: number;
  admissionDate: string;
  lastActive: string;
}

// ── Sample data (Removed) ───────────────────────────────────────

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE:  'bg-gray-100 text-gray-600 border-gray-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
};
const FEE_STYLE: Record<string, string> = {
  PAID:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
};
const MODE_STYLE: Record<string, string> = {
  OFFLINE: 'bg-blue-50 text-blue-700 border-blue-200',
  ONLINE:  'bg-purple-50 text-purple-700 border-purple-200',
  HYBRID:  'bg-orange-50 text-orange-700 border-orange-200',
};
const EXAM_COLOR: Record<string, string> = {
  JEE:        '#1a5dc9',
  NEET:       '#059669',
  BOARD:      '#f5a623',
  FOUNDATION: '#9333ea',
};

// Avatar colors cycling
const AVATAR_COLORS = [
  'linear-gradient(135deg,#1a5dc9,#0e3578)',
  'linear-gradient(135deg,#cc2529,#a81e22)',
  'linear-gradient(135deg,#f5a623,#d97706)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#9333ea,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#0e7490)',
];

// ── Attendance Ring (small) ───────────────────────────────────────────────────
const AttRing = ({ pct }: { pct: number }) => {
  const r = 13; const c = 2 * Math.PI * r;
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#f5a623' : '#cc2529';
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
        <circle cx="16" cy="16" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
        <circle cx="16" cy="16" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StudentList = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterBatch, setFilterBatch]   = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterFee, setFilterFee]       = useState('ALL');
  const [filterExam, setFilterExam]     = useState('ALL');
  const [filterMode, setFilterMode]     = useState('ALL');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [students, setStudents]         = useState<Student[]>([]);
  const PER_PAGE = 8;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/coaching/users/students');
        if (response.data) {
          const mapped = response.data.map((u: any) => ({
            id: u.id,
            admissionNo: u.studentProfile?.enrollmentNumber || 'N/A',
            rollNo: 'N/A',
            name: u.name,
            phone: u.phone || 'N/A',
            initials: u.name.substring(0, 2).toUpperCase(),
            class: u.studentProfile?.classLevel?.name || 'N/A',
            board: 'N/A',
            batch: u.studentProfile?.batches?.[0]?.batch?.name || 'Unassigned',
            targetExam: 'JEE',
            mode: 'OFFLINE',
            status: u.isActive ? 'ACTIVE' : 'INACTIVE',
            attendance: 0,
            feeStatus: 'PAID',
            feeDue: 0,
            admissionDate: new Date(u.createdAt).toLocaleDateString(),
            lastActive: 'Recently'
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch students. Using mock data.", err);
      }
    };
    fetchStudents();
  }, []);

  // Filter logic
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q)
      || s.admissionNo.toLowerCase().includes(q)
      || s.phone.includes(q)
      || s.rollNo.toLowerCase().includes(q);
    const matchBatch  = filterBatch  === 'ALL' || s.batch === filterBatch;
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchFee    = filterFee    === 'ALL' || s.feeStatus === filterFee;
    const matchExam   = filterExam   === 'ALL' || s.targetExam === filterExam;
    const matchMode   = filterMode   === 'ALL' || s.mode === filterMode;
    return matchSearch && matchBatch && matchStatus && matchFee && matchExam && matchMode;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // KPI pills
  const total    = students.length;
  const active   = students.filter(s => s.status === 'ACTIVE').length;
  const overdue  = students.filter(s => s.feeStatus === 'OVERDUE').length;
  const avgAtt   = Math.round(students.reduce((a, s) => a + s.attendance, 0) / (students.length || 1));

  const allSelected = paginated.length > 0 && paginated.every(s => selectedIds.includes(s.id));
  const toggleAll   = () => setSelectedIds(allSelected ? [] : paginated.map(s => s.id));
  const toggleOne   = (id: string) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const activeFilters = [filterBatch !== 'ALL', filterStatus !== 'ALL', filterFee !== 'ALL', filterExam !== 'ALL'].filter(Boolean).length;

  const batches = ['ALL', ...Array.from(new Set(students.map(s => s.batch)))];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>
            Students
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} of {total} students · Manage admissions, profiles & performance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="import" className="cx-btn-secondary text-xs gap-1.5 border-dashed">
            <Upload size={14} /> Import Excel
          </Link>
          <button className="cx-btn-secondary text-xs gap-1.5">
            <Download size={14} /> Export
          </button>
          <Link to="add" className="cx-btn-primary text-xs">
            <Plus size={14} /> New Admission
          </Link>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="cx-animate-in grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: total,             icon: Users,         color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Active',         value: active,            icon: TrendingUp,    color: '#059669', bg: '#ecfdf5' },
          { label: 'Fee Overdue',    value: overdue,           icon: IndianRupee,   color: '#cc2529', bg: '#fef2f2' },
          { label: 'Avg Attendance', value: `${avgAtt}%`,      icon: CalendarCheck, color: '#f5a623', bg: '#fffbeb' },
        ].map((k, i) => (
          <div key={i} className="cx-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: k.bg }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{k.label}</p>
              <p className="text-xl font-black" style={{ color: '#0d1b3e' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="cx-card cx-animate-in-2 overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b" style={{ borderColor: '#dce8f7' }}>
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              type="text"
              placeholder="Search name, roll, mobile, admission no…"
              className="cx-input pl-9 text-xs w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFilters || activeFilters > 0
                ? 'text-white border-transparent'
                : 'text-gray-600 border-gray-200 bg-white hover:border-blue-300'
            }`}
            style={showFilters || activeFilters > 0 ? { background: '#1a5dc9' } : {}}>
            <Filter size={13} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-white text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5">
                {activeFilters}
              </span>
            )}
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 ml-auto px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#e8f0fb', color: '#1448a0' }}>
              <Zap size={13} />
              {selectedIds.length} selected
              <button className="px-2 py-0.5 rounded-md text-white text-[10px] font-bold" style={{ background: '#1a5dc9' }}>
                Bulk Action
              </button>
              <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="px-5 py-4 flex flex-wrap gap-4 border-b text-xs" style={{ background: '#f7faff', borderColor: '#dce8f7' }}>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Batch</label>
              <select 
                value={filterBatch} 
                onChange={(e) => { setFilterBatch(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[140px]"
              >
                {batches.map(b => (
                  <option key={b} value={b}>{b === 'ALL' ? 'All Batches' : b}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[120px]"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fee</label>
              <select 
                value={filterFee} 
                onChange={(e) => { setFilterFee(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[120px]"
              >
                <option value="ALL">All Fees</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode</label>
              <select 
                value={filterMode} 
                onChange={(e) => { setFilterMode(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[120px]"
              >
                <option value="ALL">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Exam</label>
              <select 
                value={filterExam} 
                onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[120px]"
              >
                <option value="ALL">All Exams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="BOARD">Board</option>
                <option value="FOUNDATION">Foundation</option>
              </select>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterBatch('ALL'); setFilterStatus('ALL'); setFilterFee('ALL'); setFilterExam('ALL'); setPage(1); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-red-50 text-red-600 border border-red-100">
                <X size={11} /> Clear All
              </button>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest font-bold text-gray-400 border-b"
                style={{ background: '#f7faff', borderColor: '#dce8f7' }}>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded border-gray-300 accent-blue-600" />
                </th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission / Roll</th>
                <th className="px-4 py-3">Class & Board</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f0f4fa' }}>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: '#e8f0fb' }}>
                        <Users size={24} style={{ color: '#1a5dc9' }} />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">No students found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr 
                  key={s.id} 
                  className="group transition-colors hover:bg-blue-50/30 cursor-pointer"
                  onClick={() => navigate(s.id)}
                >
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleOne(s.id)}
                      className="rounded border-gray-300 accent-blue-600" />
                  </td>

                  {/* Student */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {s.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#0d1b3e' }}>{s.name}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Phone size={10} />{s.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Admission / Roll */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold" style={{ color: '#0d1b3e' }}>{s.admissionNo}</p>
                    <p className="text-[11px] text-gray-400">Roll: {s.rollNo}</p>
                  </td>

                  {/* Class & Board */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold" style={{ color: '#0d1b3e' }}>Class {s.class}</p>
                    <p className="text-[11px] text-gray-400">{s.board}</p>
                  </td>

                  {/* Batch */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: EXAM_COLOR[s.targetExam] }} />
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{s.batch}</span>
                    </div>
                  </td>

                  {/* Mode */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${MODE_STYLE[s.mode]}`}>
                      {s.mode}
                    </span>
                  </td>

                  {/* Attendance */}
                  <td className="px-4 py-3.5">
                    <AttRing pct={s.attendance} />
                  </td>

                  {/* Fee */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${FEE_STYLE[s.feeStatus]}`}>
                      {s.feeStatus}
                    </span>
                    {s.feeDue > 0 && (
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">₹{s.feeDue.toLocaleString()}</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${STATUS_STYLE[s.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {s.status === 'ACTIVE' ? 'Active' : s.status === 'INACTIVE' ? 'Inactive' : s.status === 'COMPLETED' ? 'Done' : 'Suspended'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 pr-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`${s.id}`}
                        className="p-1.5 rounded-lg transition-all hover:bg-blue-100"
                        title="View Profile">
                        <Eye size={14} style={{ color: '#1a5dc9' }} />
                      </Link>
                      <Link to={`${s.id}/edit`}
                        className="p-1.5 rounded-lg transition-all hover:bg-amber-100"
                        title="Edit">
                        <Edit size={14} style={{ color: '#f5a623' }} />
                      </Link>
                      <button className="p-1.5 rounded-lg transition-all hover:bg-green-100" title="WhatsApp">
                        <MessageSquare size={14} style={{ color: '#25d366' }} />
                      </button>
                      <button className="p-1.5 rounded-lg transition-all hover:bg-gray-100" title="More">
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="px-5 py-3.5 flex items-center justify-between border-t" style={{ borderColor: '#dce8f7', background: '#f7faff' }}>
          <p className="text-[11px] text-gray-500">
            Showing <span className="font-bold text-gray-800">{(page - 1) * PER_PAGE + 1}</span>–<span className="font-bold text-gray-800">{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-blue-300 disabled:opacity-40">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(totalPages, page + 2)
            ).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border ${
                  n === page
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
                style={n === page ? { background: '#1a5dc9' } : {}}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-blue-300 disabled:opacity-40">
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
