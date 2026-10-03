import React, { useState } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Edit, Eye, MessageSquare,
  ChevronLeft, ChevronRight, Download, Users, TrendingUp,
  Award, CalendarCheck, X, Phone, Briefcase, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Teacher {
  id: string;
  empId: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  subject: string;
  experience: number;
  type: 'FULL_TIME' | 'PART_TIME' | 'GUEST';
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  rating: number;
  batchesAssigned: number;
  joinDate: string;
}

// ── Sample data (Removed) ──────────────────────────────────────────────────────────────

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  ON_LEAVE: 'bg-amber-50 text-amber-700 border-amber-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
};
const TYPE_STYLE: Record<string, string> = {
  FULL_TIME: 'bg-blue-50 text-blue-700 border-blue-200',
  PART_TIME: 'bg-purple-50 text-purple-700 border-purple-200',
  GUEST:     'bg-orange-50 text-orange-700 border-orange-200',
};
const SUBJECT_COLOR: Record<string, string> = {
  Physics:   '#1a5dc9',
  Maths:     '#cc2529',
  Chemistry: '#f5a623',
  Biology:   '#059669',
};

// Avatar colors cycling
const AVATAR_COLORS = [
  'linear-gradient(135deg,#1a5dc9,#0e3578)',
  'linear-gradient(135deg,#cc2529,#a81e22)',
  'linear-gradient(135deg,#f5a623,#d97706)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#9333ea,#7c3aed)',
];

export const TeacherList = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const PER_PAGE = 8;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await api.get('/coaching/users/teachers');
          const formatted = data.map((t: any) => ({
            id: t.id,
            empId: t.id.slice(0, 8).toUpperCase(), // mock emp id
            name: t.name,
            phone: t.phone || 'N/A',
            email: t.email,
            initials: t.name.substring(0, 2).toUpperCase(),
            subject: 'General', // Would come from profile/tags
            experience: 5,
          type: 'FULL_TIME',
          status: 'ACTIVE',
          rating: 4.5,
          batchesAssigned: 2,
          joinDate: new Date(t.createdAt).toLocaleDateString()
        }));
        setTeachers(formatted);
      } catch (err) {
        console.error('Failed to fetch teachers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Filter logic
  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q)
      || t.empId.toLowerCase().includes(q)
      || t.phone.includes(q);
    const matchSubject = filterSubject === 'ALL' || t.subject === filterSubject;
    const matchStatus  = filterStatus  === 'ALL' || t.status === filterStatus;
    return matchSearch && matchSubject && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // KPI pills
  const total    = teachers.length;
  const active   = teachers.filter(t => t.status === 'ACTIVE').length;
  const avgRate  = total ? (teachers.reduce((a, t) => a + t.rating, 0) / total).toFixed(1) : '0.0';
  const maxExp   = total ? Math.max(...teachers.map(t => t.experience)) : 0;

  const activeFilters = [filterSubject !== 'ALL', filterStatus !== 'ALL'].filter(Boolean).length;
  const subjects = ['ALL', ...Array.from(new Set(teachers.map(t => t.subject)))];

  if (loading) return <div className="p-10 text-center">Loading teachers...</div>;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>
            Faculty & Teachers
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} of {total} teachers · Manage profiles, workloads & performance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="cx-btn-secondary text-xs gap-1.5">
            <Download size={14} /> Export
          </button>
          <Link to="add" className="cx-btn-primary text-xs">
            <Plus size={14} /> Add Teacher
          </Link>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="cx-animate-in grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Faculty',   value: total,           icon: Users,         color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Active Today',    value: active,          icon: CalendarCheck, color: '#059669', bg: '#ecfdf5' },
          { label: 'Highest Exp.',    value: `${maxExp} yrs`, icon: Briefcase,     color: '#cc2529', bg: '#fef2f2' },
          { label: 'Avg Rating',      value: `⭐ ${avgRate}`, icon: Award,         color: '#f5a623', bg: '#fffbeb' },
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
              placeholder="Search by name, emp id, or phone…"
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
            style={showFilters || activeFilters > 0 ? { background: '#cc2529' } : {}}>
            <Filter size={13} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <div className="px-5 py-3 flex flex-wrap gap-3 border-b text-xs" style={{ background: '#fdf2f2', borderColor: '#fef2f2' }}>
            {/* Subject */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Subject:</span>
              <div className="flex gap-1 flex-wrap">
                {subjects.map(s => (
                  <button key={s} onClick={() => { setFilterSubject(s); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                      filterSubject === s ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                    }`}
                    style={filterSubject === s ? { background: '#cc2529' } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Status:</span>
              {['ALL','ACTIVE','ON_LEAVE','INACTIVE'].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    filterStatus === s ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                  style={filterStatus === s ? { background: '#cc2529' } : {}}>
                  {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterSubject('ALL'); setFilterStatus('ALL'); setPage(1); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-red-100 text-red-700 border border-red-200">
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
                <th className="px-4 py-3 pl-6">Faculty Profile</th>
                <th className="px-4 py-3">Emp ID & Joined</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Type & Exp</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f0f4fa' }}>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: '#fef2f2' }}>
                        <Users size={24} style={{ color: '#cc2529' }} />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">No teachers found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((t, i) => (
                <tr key={t.id} onClick={() => navigate(t.id)} className="group transition-colors hover:bg-blue-50/30 cursor-pointer">
                  {/* Profile */}
                  <td className="px-4 py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {t.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate flex items-center gap-1.5" style={{ color: '#0d1b3e' }}>
                          {t.name}
                          {t.rating >= 4.8 && <Sparkles size={12} style={{ color: '#f5a623' }} />}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Phone size={10} />{t.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ID & Join */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold" style={{ color: '#0d1b3e' }}>{t.empId}</p>
                    <p className="text-[11px] text-gray-400">Joined: {t.joinDate}</p>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: SUBJECT_COLOR[t.subject] || '#1a5dc9' }} />
                      <span className="text-xs font-medium text-gray-700">{t.subject}</span>
                    </div>
                  </td>

                  {/* Type & Exp */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${TYPE_STYLE[t.type]}`}>
                      {t.type.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">{t.experience} Years Exp.</p>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Award size={14} style={{ color: '#f5a623' }} />
                      <span className="text-xs font-bold" style={{ color: '#0d1b3e' }}>{t.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.batchesAssigned} Batches</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${STATUS_STYLE[t.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 pr-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); navigate(t.id); }}
                        className="p-1.5 rounded-lg transition-all hover:bg-blue-100"
                        title="View Profile">
                        <Eye size={14} style={{ color: '#1a5dc9' }} />
                      </button>
                      <Link to={`${t.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg transition-all hover:bg-amber-100"
                        title="Edit">
                        <Edit size={14} style={{ color: '#f5a623' }} />
                      </Link>
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg transition-all hover:bg-green-100" title="WhatsApp">
                        <MessageSquare size={14} style={{ color: '#25d366' }} />
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg transition-all hover:bg-gray-100" title="More">
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
            Showing <span className="font-bold text-gray-800">{filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}</span>–<span className="font-bold text-gray-800">{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-red-300 disabled:opacity-40">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(totalPages, page + 2)
            ).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border ${
                  n === page
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 hover:border-red-300'
                }`}
                style={n === page ? { background: '#cc2529' } : {}}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-red-300 disabled:opacity-40">
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
