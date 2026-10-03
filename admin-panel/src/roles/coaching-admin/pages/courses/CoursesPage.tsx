import React, { useState, useEffect } from 'react';
import {
  BookOpen, ShoppingCart, Search, Plus, Video, FileText, Users,
  IndianRupee, ToggleLeft, ToggleRight, Pencil, Trash2, PlayCircle,
  ChevronLeft, ChevronRight, Globe, Award, AlertCircle, CheckCircle2,
  Edit
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../../api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function countResources(modules: any[]) {
  let videos = 0, docs = 0, chapters = 0;
  for (const m of modules || []) {
    for (const ch of m.chapters || []) {
      chapters++;
      for (const l of ch.lessons || []) {
        for (const r of l.resources || []) {
          if (r.type === 'VIDEO') videos++; else docs++;
        }
      }
    }
  }
  return { videos, docs, chapters };
}

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT:     'bg-amber-50  text-amber-700  border-amber-200',
  ARCHIVED:  'bg-gray-100  text-gray-600   border-gray-200',
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ course, onConfirm, onCancel }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4 cx-animate-in">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
        <AlertCircle size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-black text-center" style={{ color: '#0d1b3e' }}>Delete Course?</h3>
      <p className="text-sm text-gray-500 text-center mt-2">
        <span className="font-semibold text-gray-700">"{course.title}"</span> aur saare modules/chapters permanently delete ho jayenge.
      </p>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
const EditModal = ({ course, onSave, onCancel }: any) => {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description || '',
    price: String(course.price ?? ''),
    validityDays: String(course.validityDays ?? ''),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/coaching/lms/courses/${course.id}`, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        validityDays: form.validityDays ? parseInt(form.validityDays) : null,
      });
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full mx-4 cx-animate-in">
        <h3 className="text-base font-black mb-5" style={{ color: '#0d1b3e' }}>Edit Course</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="cx-input w-full text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="cx-input w-full text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="cx-input w-full text-sm" placeholder="0 = Free" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Validity (Days)</label>
              <input type="number" value={form.validityDays} onChange={e => setForm(f => ({ ...f, validityDays: e.target.value }))}
                className="cx-input w-full text-sm" placeholder="Blank = Lifetime" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main CoursesPage
// ─────────────────────────────────────────────────────────────────────────────
type TabType = 'library' | 'store';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from URL hash or query param
  const initTab: TabType = location.hash === '#store' ? 'store' : 'library';
  const [tab, setTab] = useState<TabType>(initTab);

  // Shared state
  const [courses, setCourses]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage]               = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editTarget, setEditTarget]   = useState<any>(null);
  const [togglingId, setTogglingId]   = useState<string | null>(null);
  const PER_PAGE = 8;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coaching/lms/courses');
      const mapped = (data || []).map((c: any) => {
        const { videos, docs, chapters } = countResources(c.modules || []);
        return {
          id:           c.id,
          title:        c.title || c.name || 'Untitled',
          description:  c.description || '',
          subject:      c.subject?.name || '—',
          price:        parseFloat(c.price) || 0,
          validityDays: c.validityDays,
          isPublished:  c.isPublished,
          status:       c.isPublished ? 'PUBLISHED' : (c.status || 'DRAFT'),
          modulesCount: c.modules?.length || 0,
          chaptersCount: chapters,
          videosCount:  videos,
          docsCount:    docs,
          enrollments:  c.enrollments?.length || 0,
          lastUpdated:  new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN'),
        };
      });
      setCourses(mapped);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Sync tab to URL hash
  const switchTab = (t: TabType) => {
    setTab(t);
    setSearch('');
    setPage(1);
    setFilterStatus('ALL');
    navigate(`/courses${t === 'store' ? '#store' : ''}`, { replace: true });
  };

  const handleTogglePublish = async (c: any) => {
    setTogglingId(c.id);
    try {
      await api.patch(`/coaching/lms/courses/${c.id}/publish`);
      setCourses(prev => prev.map(x => x.id === c.id
        ? { ...x, isPublished: !x.isPublished, status: !x.isPublished ? 'PUBLISHED' : 'DRAFT' }
        : x));
    } catch { /* silent */ }
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/coaching/lms/courses/${deleteTarget.id}`);
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
    } finally { setDeleteTarget(null); }
  };

  // Filtering
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    const matchF = filterStatus === 'ALL' || c.status === filterStatus;
    return matchQ && matchF;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // KPIs
  const totalLive        = courses.filter(c => c.isPublished).length;
  const totalEnrollments = courses.reduce((a, c) => a + c.enrollments, 0);
  const totalPaid        = courses.filter(c => c.price > 0).length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* Modals */}
      {deleteTarget && <DeleteModal course={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {editTarget   && (
        <EditModal
          course={editTarget}
          onCancel={() => setEditTarget(null)}
          onSave={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* ── Page Header ── */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>Courses</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {tab === 'library'
              ? 'Content manage karo — modules, chapters, videos, notes.'
              : 'Business manage karo — pricing, publish/unpublish, enrollments.'}
          </p>
        </div>
        <Link to="/courses/add"
          className="cx-btn-primary text-xs flex-shrink-0 flex items-center gap-2">
          <Plus size={14} /> New Course
        </Link>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="cx-animate-in flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: '#e8f0fb', border: '1px solid #c8daf5' }}>
        {([
          { key: 'library', icon: BookOpen,     label: 'Course Library' },
          { key: 'store',   icon: ShoppingCart, label: 'Store & Pricing' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => switchTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === key
                ? 'text-white shadow-md'
                : 'text-blue-600 hover:bg-blue-100/60'
            }`}
            style={tab === key ? { background: 'linear-gradient(135deg,#1a5dc9,#0e3578)' } : {}}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── KPI Cards (Store tab only) ── */}
      {tab === 'store' && (
        <div className="cx-animate-in grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Courses',     value: courses.length,   icon: BookOpen,    color: '#1a5dc9', bg: '#e8f0fb' },
            { label: 'Live / Published',  value: totalLive,        icon: Globe,       color: '#059669', bg: '#ecfdf5' },
            { label: 'Total Enrollments', value: totalEnrollments, icon: Users,       color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Paid Courses',      value: totalPaid,        icon: IndianRupee, color: '#d97706', bg: '#fffbeb' },
          ].map((k, i) => (
            <div key={i} className="cx-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: k.bg }}>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">{k.label}</p>
                <p className="text-2xl font-black" style={{ color: '#0d1b3e' }}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="cx-card cx-animate-in-2 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b"
          style={{ borderColor: '#dce8f7' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              type="text"
              placeholder="Search by title…"
              className="cx-input pl-9 text-xs w-full"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(f => (
              <button key={f} onClick={() => { setFilterStatus(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  filterStatus === f
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
                style={filterStatus === f ? { background: '#1a5dc9' } : {}}>
                {f === 'ALL' ? 'All' : f === 'PUBLISHED' ? '🟢 Published' : '⚪ Draft'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading courses…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest font-bold text-gray-400 border-b"
                  style={{ background: '#f7faff', borderColor: '#dce8f7' }}>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-4 py-3">Content</th>
                  {tab === 'store' && <th className="px-4 py-3">Pricing</th>}
                  <th className="px-4 py-3">Enrollments</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#f0f4fa' }}>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={tab === 'store' ? 6 : 5} className="py-20 text-center">
                      <BookOpen size={32} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm font-semibold text-gray-400">Koi course nahi mila</p>
                      <Link to="/courses/add"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-blue-600 hover:underline">
                        <Plus size={12} /> Pehla course banao
                      </Link>
                    </td>
                  </tr>
                ) : paginated.map(c => (
                  <tr key={c.id} className="group transition-colors hover:bg-blue-50/30">

                    {/* Course */}
                    <td className="px-5 py-4 min-w-[240px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#1a5dc9,#001233)' }}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-snug">{c.title}</p>
                          {tab === 'library' && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{c.subject}</p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-0.5">Updated {c.lastUpdated}</p>
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 text-[11px] font-semibold text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Video size={11} className="text-blue-500" /> {c.videosCount} Videos
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText size={11} className="text-emerald-500" /> {c.docsCount} Docs
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={11} className="text-gray-400" /> {c.chaptersCount} Ch.
                        </span>
                      </div>
                    </td>

                    {/* Pricing (Store only) */}
                    {tab === 'store' && (
                      <td className="px-4 py-4">
                        {c.price === 0 ? (
                          <div>
                            <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                              <Award size={12} /> FREE
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Open access</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm font-black flex items-center gap-0.5" style={{ color: '#0d1b3e' }}>
                              <IndianRupee size={12} />{c.price.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {c.validityDays ? `${c.validityDays} days` : 'Lifetime'}
                            </p>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Enrollments */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-violet-500" />
                        <span className="text-sm font-black" style={{ color: '#0d1b3e' }}>{c.enrollments}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {tab === 'store' ? (
                        /* Toggle in store mode */
                        <button
                          onClick={() => handleTogglePublish(c)}
                          disabled={togglingId === c.id}
                          className="flex items-center gap-1.5 group/toggle">
                          {togglingId === c.id
                            ? <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            : c.isPublished
                              ? <ToggleRight size={20} className="text-emerald-500" />
                              : <ToggleLeft  size={20} className="text-gray-300" />
                          }
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            c.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </button>
                      ) : (
                        /* Badge in library mode */
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${STATUS_STYLE[c.status] || STATUS_STYLE.DRAFT}`}>
                          {c.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/courses/${c.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-100 transition-all"
                          title="Manage Content">
                          <PlayCircle size={14} style={{ color: '#1a5dc9' }} />
                        </Link>
                        <button onClick={() => setEditTarget(c)}
                          className="p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                          title="Edit Details">
                          <Pencil size={14} style={{ color: '#f5a623' }} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-all"
                          title="Delete">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <div className="px-5 py-3.5 flex items-center justify-between border-t"
            style={{ borderColor: '#dce8f7', background: '#f7faff' }}>
            <p className="text-[11px] text-gray-500">
              Showing <b className="text-gray-800">{(page - 1) * PER_PAGE + 1}</b>–
              <b className="text-gray-800">{Math.min(page * PER_PAGE, filtered.length)}</b> of{' '}
              <b className="text-gray-800">{filtered.length}</b>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:border-blue-300 disabled:opacity-40 transition-all">
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:border-blue-300 disabled:opacity-40 transition-all">
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips (Store tab) */}
      {tab === 'store' && (
        <div className="cx-card cx-animate-in-2 p-5">
          <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-3">📋 Quick Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <ToggleRight size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><b className="text-gray-700">Publish toggle</b> — Green toggle = Live. Draft mein students enroll nahi kar sakte.</span>
            </div>
            <div className="flex items-start gap-2">
              <IndianRupee size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span><b className="text-gray-700">Pricing</b> — Price 0 = Free course. Validity blank = Lifetime access.</span>
            </div>
            <div className="flex items-start gap-2">
              <Pencil size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span><b className="text-gray-700">Edit</b> — Pencil icon click karo price ya title change karne ke liye.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
