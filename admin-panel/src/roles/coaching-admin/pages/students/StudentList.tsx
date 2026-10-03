import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Edit, Eye, MessageSquare,
  ChevronLeft, ChevronRight, Download, Users, TrendingUp,
  IndianRupee, CalendarCheck, X, ChevronDown, Phone, Zap, Upload,
  Check, Loader2
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
  attendance: number;
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  feeDue: number;
  admissionDate: string;
  lastActive: string;
}

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
const AVATAR_COLORS = [
  'linear-gradient(135deg,#1a5dc9,#0e3578)',
  'linear-gradient(135deg,#cc2529,#a81e22)',
  'linear-gradient(135deg,#f5a623,#d97706)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#9333ea,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#0e7490)',
];

// ── Attendance Ring ───────────────────────────────────────────────────────────
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

// ── Add Student Drawer ────────────────────────────────────────────────────────
const AddStudentDrawer = ({
  open, onClose, onSaved
}: { open: boolean; onClose: () => void; onSaved: () => void }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', dob: '', gender: '', mobile: '', email: '',
    classLevel: '', board: '', targetExam: '', batch: '', mode: 'OFFLINE',
    fatherName: '', fatherMobile: '', motherName: '', motherMobile: '',
    address: '', city: '', state: '', pincode: '',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!open) return;
    api.get('/coaching/academic/batches')
      .then(res => {
        const list: any[] =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data?.data?.items) ? res.data.data.items :
          Array.isArray(res.data?.items) ? res.data.items : [];
        setBatches(list);
      }).catch(() => setBatches([]));
  }, [open]);

  const reset = () => {
    setForm({ fullName: '', dob: '', gender: '', mobile: '', email: '',
      classLevel: '', board: '', targetExam: '', batch: '', mode: 'OFFLINE',
      fatherName: '', fatherMobile: '', motherName: '', motherMobile: '',
      address: '', city: '', state: '', pincode: '' });
    setError('');
    setSaving(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.mobile.trim() || !form.gender || !form.fatherName.trim()) {
      setError('Required fields: Full Name, Mobile, Gender, Father\'s Name');
      return;
    }
    setError(''); setSaving(true);
    try {
      await api.post('/coaching/users/students', {
        name: form.fullName, phone: form.mobile,
        email: form.email || undefined, passwordHash: form.mobile, isActive: true,
        profileData: { studentType: form.mode },
        batchId: form.batch || undefined,
        guardians: [
          { name: form.fatherName, relation: 'FATHER', phone: form.fatherMobile, isPrimary: true },
          ...(form.motherName ? [{ name: form.motherName, relation: 'MOTHER', phone: form.motherMobile, isPrimary: false }] : []),
        ],
      });
      reset(); onSaved(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: 'min(520px, 100vw)', borderLeft: '1px solid #dce8f7' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: '#dce8f7', background: '#f8fafd' }}>
          <div>
            <h2 className="text-base font-black" style={{ color: '#0d1b3e' }}>New Student Admission</h2>
            <p className="text-xs text-gray-400">Fill details and save</p>
          </div>
          <button onClick={handleClose}
            className="p-2 rounded-xl hover:bg-red-50 transition-colors">
            <X size={18} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {/* Student Info */}
          <DrawerSection title="🎓 Student Information">
            <div className="grid grid-cols-2 gap-3">
              <DField label="Full Name" required span2>
                <input className="cx-input w-full text-sm" placeholder="Rahul Sharma"
                  value={form.fullName} onChange={e => set('fullName', e.target.value)} />
              </DField>
              <DField label="Mobile" required>
                <input className="cx-input w-full text-sm" type="tel" maxLength={10} placeholder="10 digits"
                  value={form.mobile} onChange={e => set('mobile', e.target.value)} />
              </DField>
              <DField label="Gender" required>
                <select className="cx-input w-full text-sm" value={form.gender}
                  onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </DField>
              <DField label="Date of Birth">
                <input className="cx-input w-full text-sm" type="date"
                  value={form.dob} onChange={e => set('dob', e.target.value)} />
              </DField>
              <DField label="Email" span2>
                <input className="cx-input w-full text-sm" type="email" placeholder="Optional"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </DField>
            </div>
          </DrawerSection>

          {/* Course */}
          <DrawerSection title="📚 Course Details">
            <div className="grid grid-cols-2 gap-3">
              <DField label="Class">
                <select className="cx-input w-full text-sm" value={form.classLevel}
                  onChange={e => set('classLevel', e.target.value)}>
                  <option value="">Select</option>
                  {['IX','X','XI','XII'].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </DField>
              <DField label="Board">
                <select className="cx-input w-full text-sm" value={form.board}
                  onChange={e => set('board', e.target.value)}>
                  <option value="">Select</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="BSEB">BSEB (Bihar)</option>
                  <option value="STATE">Other State</option>
                </select>
              </DField>
              <DField label="Target Exam">
                <select className="cx-input w-full text-sm" value={form.targetExam}
                  onChange={e => set('targetExam', e.target.value)}>
                  <option value="">Select</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="BOARD">Board Only</option>
                  <option value="FOUNDATION">Foundation</option>
                </select>
              </DField>
              <DField label="Study Mode">
                <select className="cx-input w-full text-sm" value={form.mode}
                  onChange={e => set('mode', e.target.value)}>
                  <option value="OFFLINE">Offline</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </DField>
              <DField label="Batch" span2>
                <select className="cx-input w-full text-sm" value={form.batch}
                  onChange={e => set('batch', e.target.value)}>
                  <option value="">No Batch (Assign Later)</option>
                  {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </DField>
            </div>
          </DrawerSection>

          {/* Guardian */}
          <DrawerSection title="👨‍👩‍👦 Parent / Guardian">
            <div className="grid grid-cols-2 gap-3">
              <DField label="Father's Name" required>
                <input className="cx-input w-full text-sm" placeholder="Full name"
                  value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
              </DField>
              <DField label="Father's Mobile">
                <input className="cx-input w-full text-sm" type="tel" maxLength={10}
                  value={form.fatherMobile} onChange={e => set('fatherMobile', e.target.value)} />
              </DField>
              <DField label="Mother's Name">
                <input className="cx-input w-full text-sm" placeholder="Optional"
                  value={form.motherName} onChange={e => set('motherName', e.target.value)} />
              </DField>
              <DField label="Mother's Mobile">
                <input className="cx-input w-full text-sm" type="tel" maxLength={10}
                  value={form.motherMobile} onChange={e => set('motherMobile', e.target.value)} />
              </DField>
            </div>
          </DrawerSection>

          {/* Address */}
          <DrawerSection title="🏠 Address (Optional)">
            <div className="grid grid-cols-2 gap-3">
              <DField label="Street / House No." span2>
                <input className="cx-input w-full text-sm" placeholder="House no., Street"
                  value={form.address} onChange={e => set('address', e.target.value)} />
              </DField>
              <DField label="City">
                <input className="cx-input w-full text-sm" placeholder="e.g. Patna"
                  value={form.city} onChange={e => set('city', e.target.value)} />
              </DField>
              <DField label="Pincode">
                <input className="cx-input w-full text-sm" maxLength={6} placeholder="6-digit"
                  value={form.pincode} onChange={e => set('pincode', e.target.value)} />
              </DField>
            </div>
          </DrawerSection>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: '#dce8f7', background: '#f8fafd' }}>
          <button type="button" onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:border-blue-300"
            style={{ borderColor: '#dce8f7', color: '#0d1b3e' }}>
            Cancel
          </button>
          <button onClick={handleSubmit as any} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 14px rgba(26,93,201,0.4)' }}>
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : <><Check size={14} strokeWidth={3} /> Add Student</>}
          </button>
        </div>
      </div>
    </>
  );
};

const DrawerSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#dce8f7' }}>
    <div className="px-4 py-2.5 border-b text-xs font-bold" style={{ borderColor: '#dce8f7', background: '#f8fafd', color: '#0d1b3e' }}>
      {title}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const DField = ({ label, required, span2, children }: { label: string; required?: boolean; span2?: boolean; children: React.ReactNode }) => (
  <div className={`space-y-1 ${span2 ? 'col-span-2' : ''}`}>
    <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

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
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const PER_PAGE = 8;

  const loadStudents = async () => {
    try {
      const response = await api.get('/coaching/users/students');
      if (response.data) {
        const rawList: any[] =
          Array.isArray(response.data) ? response.data :
          Array.isArray(response.data.data) ? response.data.data :
          Array.isArray(response.data.data?.items) ? response.data.data.items :
          Array.isArray(response.data.items) ? response.data.items :
          [];
        const mapped = rawList.map((u: any) => ({
          id: u.id,
          admissionNo: u.studentProfile?.enrollmentNumber || 'N/A',
          rollNo: 'N/A',
          name: u.name,
          phone: u.phone || 'N/A',
          initials: u.name?.substring(0, 2).toUpperCase() || 'ST',
          class: u.studentProfile?.classLevel?.name || 'N/A',
          board: 'N/A',
          batch: u.studentProfile?.batches?.[0]?.batch?.name || 'Unassigned',
          targetExam: 'JEE' as Student['targetExam'],
          mode: 'OFFLINE' as Student['mode'],
          status: (u.isActive ? 'ACTIVE' : 'INACTIVE') as Student['status'],
          attendance: 0,
          feeStatus: 'PAID' as Student['feeStatus'],
          feeDue: 0,
          admissionDate: new Date(u.createdAt).toLocaleDateString(),
          lastActive: 'Recently'
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch students.', err);
    }
  };

  useEffect(() => { loadStudents(); }, []);

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

  const total    = students.length;
  const active   = students.filter(s => s.status === 'ACTIVE').length;
  const overdue  = students.filter(s => s.feeStatus === 'OVERDUE').length;
  const avgAtt   = Math.round(students.reduce((a, s) => a + s.attendance, 0) / (students.length || 1));

  const allSelected = paginated.length > 0 && paginated.every(s => selectedIds.includes(s.id));
  const toggleAll   = () => setSelectedIds(allSelected ? [] : paginated.map(s => s.id));
  const toggleOne   = (id: string) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const activeFilters = [filterBatch !== 'ALL', filterStatus !== 'ALL', filterFee !== 'ALL', filterExam !== 'ALL'].filter(Boolean).length;
  const batchOptions = ['ALL', ...Array.from(new Set(students.map(s => s.batch)))];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* Drawer */}
      <AddStudentDrawer
        open={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onSaved={() => { loadStudents(); }}
      />

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
          <button onClick={() => setShowAddDrawer(true)} className="cx-btn-primary text-xs">
            <Plus size={14} /> New Admission
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="cx-animate-in grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: total,        icon: Users,         color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Active',         value: active,       icon: TrendingUp,    color: '#059669', bg: '#ecfdf5' },
          { label: 'Fee Overdue',    value: overdue,      icon: IndianRupee,   color: '#cc2529', bg: '#fef2f2' },
          { label: 'Avg Attendance', value: `${avgAtt}%`, icon: CalendarCheck, color: '#f5a623', bg: '#fffbeb' },
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
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              type="text"
              placeholder="Search name, roll, mobile…"
              className="cx-input pl-9 text-xs w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

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
            {[
              { label: 'Batch', value: filterBatch, onChange: setFilterBatch, options: batchOptions.map(b => ({ value: b, label: b === 'ALL' ? 'All Batches' : b })) },
              { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ value: 'ALL', label: 'All Status' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'SUSPENDED', label: 'Suspended' }] },
              { label: 'Fee', value: filterFee, onChange: setFilterFee, options: [{ value: 'ALL', label: 'All Fees' }, { value: 'PAID', label: 'Paid' }, { value: 'PENDING', label: 'Pending' }, { value: 'OVERDUE', label: 'Overdue' }] },
              { label: 'Mode', value: filterMode, onChange: setFilterMode, options: [{ value: 'ALL', label: 'All Modes' }, { value: 'OFFLINE', label: 'Offline' }, { value: 'ONLINE', label: 'Online' }, { value: 'HYBRID', label: 'Hybrid' }] },
              { label: 'Exam', value: filterExam, onChange: setFilterExam, options: [{ value: 'ALL', label: 'All Exams' }, { value: 'JEE', label: 'JEE' }, { value: 'NEET', label: 'NEET' }, { value: 'BOARD', label: 'Board' }, { value: 'FOUNDATION', label: 'Foundation' }] },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{f.label}</label>
                <select value={f.value} onChange={e => { f.onChange(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-blue-500 min-w-[120px]">
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterBatch('ALL'); setFilterStatus('ALL'); setFilterFee('ALL'); setFilterExam('ALL'); setFilterMode('ALL'); setPage(1); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-red-50 text-red-600 border border-red-100 self-end">
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
                      <p className="text-xs text-gray-400">Try adjusting filters or add new student</p>
                      <button onClick={() => setShowAddDrawer(true)}
                        className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: '#1a5dc9' }}>
                        <Plus size={13} /> Add First Student
                      </button>
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

                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold" style={{ color: '#0d1b3e' }}>{s.admissionNo}</p>
                    <p className="text-[11px] text-gray-400">Roll: {s.rollNo}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold" style={{ color: '#0d1b3e' }}>Class {s.class}</p>
                    <p className="text-[11px] text-gray-400">{s.board}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: EXAM_COLOR[s.targetExam] }} />
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{s.batch}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${MODE_STYLE[s.mode]}`}>
                      {s.mode}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <AttRing pct={s.attendance} />
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${FEE_STYLE[s.feeStatus]}`}>
                      {s.feeStatus}
                    </span>
                    {s.feeDue > 0 && (
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">₹{s.feeDue.toLocaleString()}</p>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${STATUS_STYLE[s.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {s.status === 'ACTIVE' ? 'Active' : s.status === 'INACTIVE' ? 'Inactive' : s.status === 'COMPLETED' ? 'Done' : 'Suspended'}
                    </span>
                  </td>

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
