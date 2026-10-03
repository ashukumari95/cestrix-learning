import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../api';

// ── Simple Admission Form ─────────────────────────────────────────────────────
export const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [batches, setBatches] = useState<any[]>([]);

  const [form, setForm] = useState({
    // Student
    fullName: '',
    dob: '',
    gender: '',
    mobile: '',
    email: '',
    // Academic
    classLevel: '',
    board: '',
    targetExam: '',
    batch: '',
    mode: 'OFFLINE',
    // Guardian
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    motherMobile: '',
    // Address
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    api.get('/coaching/academic/batches')
      .then(res => {
        const list: any[] =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data?.data?.items) ? res.data.data.items :
          Array.isArray(res.data?.items) ? res.data.items : [];
        setBatches(list);
      })
      .catch(() => setBatches([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.mobile.trim() || !form.gender || !form.fatherName.trim()) {
      setError('Please fill all required fields marked with *');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/coaching/users/students', {
        name: form.fullName,
        phone: form.mobile,
        email: form.email || undefined,
        passwordHash: form.mobile,
        isActive: true,
        profileData: {
          studentType: form.mode as 'OFFLINE' | 'ONLINE' | 'HYBRID',
        },
        batchId: form.batch || undefined,
        address: form.address ? {
          street: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        } : undefined,
        guardians: form.fatherName ? [
          {
            name: form.fatherName,
            relation: 'FATHER',
            phone: form.fatherMobile,
            isPrimary: true,
          },
          ...(form.motherName ? [{
            name: form.motherName,
            relation: 'MOTHER',
            phone: form.motherMobile,
            isPrimary: false,
          }] : []),
        ] : [],
      });
      setSuccess(true);
      setTimeout(() => navigate('..'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
            <Check size={28} style={{ color: '#059669' }} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black" style={{ color: '#0d1b3e' }}>Student Added!</h2>
          <p className="text-sm text-gray-400">Redirecting to student list…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to=".." className="p-2 rounded-xl border hover:border-blue-300 transition-all"
          style={{ borderColor: '#dce8f7' }}>
          <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>New Student Admission</h1>
          <p className="text-xs text-gray-400">Fill in student details to complete admission</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* ── Section 1: Student Info ── */}
        <Section title="🎓 Student Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className="cx-input w-full" placeholder="e.g. Rahul Sharma"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </Field>
            <Field label="Date of Birth">
              <input className="cx-input w-full" type="date"
                value={form.dob} onChange={e => set('dob', e.target.value)} />
            </Field>
            <Field label="Gender" required>
              <select className="cx-input w-full" value={form.gender}
                onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Mobile No." required>
              <input className="cx-input w-full" type="tel" maxLength={10}
                placeholder="10-digit number"
                value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </Field>
            <Field label="Email ID">
              <input className="cx-input w-full" type="email" placeholder="Optional"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── Section 2: Course & Batch ── */}
        <Section title="📚 Course Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Class">
              <select className="cx-input w-full" value={form.classLevel}
                onChange={e => set('classLevel', e.target.value)}>
                <option value="">Select Class</option>
                {['IX','X','XI','XII'].map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </Field>
            <Field label="Board">
              <select className="cx-input w-full" value={form.board}
                onChange={e => set('board', e.target.value)}>
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="BSEB">BSEB (Bihar Board)</option>
                <option value="STATE">Other State Board</option>
              </select>
            </Field>
            <Field label="Target Exam">
              <select className="cx-input w-full" value={form.targetExam}
                onChange={e => set('targetExam', e.target.value)}>
                <option value="">Select Target</option>
                <option value="JEE">JEE (Mains + Advanced)</option>
                <option value="NEET">NEET UG</option>
                <option value="BOARD">Board Exam Only</option>
                <option value="FOUNDATION">Foundation (Class 9/10)</option>
              </select>
            </Field>
            <Field label="Batch">
              <select className="cx-input w-full" value={form.batch}
                onChange={e => set('batch', e.target.value)}>
                <option value="">No Batch (Assign Later)</option>
                {batches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Study Mode">
              <select className="cx-input w-full" value={form.mode}
                onChange={e => set('mode', e.target.value)}>
                <option value="OFFLINE">Offline (Centre)</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Section 3: Guardian ── */}
        <Section title="👨‍👩‍👦 Parent / Guardian Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Father's Name" required>
              <input className="cx-input w-full" placeholder="Full name"
                value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
            </Field>
            <Field label="Father's Mobile">
              <input className="cx-input w-full" type="tel" maxLength={10}
                placeholder="10-digit number"
                value={form.fatherMobile} onChange={e => set('fatherMobile', e.target.value)} />
            </Field>
            <Field label="Mother's Name">
              <input className="cx-input w-full" placeholder="Full name"
                value={form.motherName} onChange={e => set('motherName', e.target.value)} />
            </Field>
            <Field label="Mother's Mobile">
              <input className="cx-input w-full" type="tel" maxLength={10}
                placeholder="10-digit number"
                value={form.motherMobile} onChange={e => set('motherMobile', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── Section 4: Address ── */}
        <Section title="🏠 Address (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Street / House No.">
              <input className="cx-input w-full" placeholder="House no., Street name"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </Field>
            <Field label="City">
              <input className="cx-input w-full" placeholder="e.g. Patna"
                value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
            <Field label="State">
              <input className="cx-input w-full" placeholder="e.g. Bihar"
                value={form.state} onChange={e => set('state', e.target.value)} />
            </Field>
            <Field label="Pincode">
              <input className="cx-input w-full" maxLength={6} placeholder="6-digit"
                value={form.pincode} onChange={e => set('pincode', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <Link to=".." className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:border-blue-300"
            style={{ borderColor: '#dce8f7', color: '#0d1b3e' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 14px rgba(26,93,201,0.4)' }}>
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><Check size={15} strokeWidth={3} /> Add Student</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="cx-card overflow-hidden">
    <div className="px-5 py-3 border-b" style={{ borderColor: '#dce8f7', background: '#f8fafd' }}>
      <p className="text-sm font-bold" style={{ color: '#0d1b3e' }}>{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);
