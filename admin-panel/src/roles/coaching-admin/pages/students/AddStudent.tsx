import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Check, User, Users, GraduationCap,
  Layers, FileText, Upload, Phone, Mail, MapPin, Calendar,
  BookOpen, Target, Hash, Camera, AlertCircle, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../api';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal',   icon: User,          desc: 'Basic info & photo' },
  { id: 2, label: 'Guardian',   icon: Users,         desc: 'Father / Mother' },
  { id: 3, label: 'Academic',   icon: GraduationCap, desc: 'Class, board & exam' },
  { id: 4, label: 'Batch',      icon: Layers,        desc: 'Enroll in batch' },
  { id: 5, label: 'Documents',  icon: FileText,      desc: 'Upload files' },
];

// ── Form data model ───────────────────────────────────────────────────────────
const INIT = {
  // Step 1 — Personal
  fullName: '', dob: '', gender: '', mobile: '', email: '',
  address: '', city: '', state: '', pincode: '',
  status: 'ACTIVE', photo: null as File | null,

  // Step 2 — Guardian
  fatherName: '', fatherMobile: '', fatherOccupation: '', fatherWhatsapp: '',
  motherName: '', motherMobile: '', motherOccupation: '',
  guardianName: '', guardianMobile: '', guardianRelation: '',

  // Step 3 — Academic
  class: '', board: '', targetExam: '', academicYear: '2025-26',
  prevSchool: '', prevClass: '', prevPercent: '', prevBoard: '',
  mode: 'OFFLINE',

  // Step 4 — Batch
  batchId: '', rollNo: '',

  // Step 5 — Docs
  docs: {} as Record<string, File | null>,
  
  // Internal state
  batchName: '',
};

type FormData = typeof INIT;

// ── Helpers ───────────────────────────────────────────────────────────────────
const Field = ({
  label, id, required, children
}: { label: string; id: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-xs font-bold text-gray-600 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="cx-input text-sm w-full" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="cx-input text-sm w-full cursor-pointer" />
);

// ── STEP 1: Personal Info ─────────────────────────────────────────────────────
const Step1 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('photo', file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Photo upload */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: preview ? 'transparent' : '#e8f0fb', border: '2px dashed #9dbcee' }}>
            {preview
              ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
              : <Camera size={22} style={{ color: '#1a5dc9' }} />
            }
          </div>
          <label htmlFor="photo-upload"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-white"
            style={{ background: '#1a5dc9' }}>
            <Upload size={12} />
          </label>
          <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0d1b3e' }}>Student Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG/PNG, max 2MB. Clear face photo required.</p>
          {preview && (
            <button onClick={() => { setPreview(null); set('photo', null); }}
              className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <X size={11} /> Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" id="fullName" required>
          <Input id="fullName" value={data.fullName} onChange={e => set('fullName', e.target.value)}
            placeholder="e.g. Rahul Sharma" />
        </Field>

        <Field label="Date of Birth" id="dob" required>
          <Input id="dob" type="date" value={data.dob} onChange={e => set('dob', e.target.value)} />
        </Field>

        <Field label="Gender" id="gender" required>
          <Select id="gender" value={data.gender} onChange={e => set('gender', e.target.value)}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>

        <Field label="Student Mobile" id="mobile" required>
          <Input id="mobile" type="tel" value={data.mobile} onChange={e => set('mobile', e.target.value)}
            placeholder="10-digit mobile no." maxLength={10} />
        </Field>

        <Field label="Email ID" id="email">
          <Input id="email" type="email" value={data.email} onChange={e => set('email', e.target.value)}
            placeholder="Optional" />
        </Field>

        <Field label="Status" id="status" required>
          <Select id="status" value={data.status} onChange={e => set('status', e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: '#dce8f7' }}>
        <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
          <MapPin size={13} /> Home Address
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address Line 1" id="address" required>
            <Input id="address" value={data.address} onChange={e => set('address', e.target.value)}
              placeholder="House no., Street name" />
          </Field>
          <Field label="City" id="city" required>
            <Input id="city" value={data.city} onChange={e => set('city', e.target.value)}
              placeholder="e.g. Patna" />
          </Field>
          <Field label="State" id="state" required>
            <Input id="state" value={data.state} onChange={e => set('state', e.target.value)}
              placeholder="e.g. Bihar" />
          </Field>
          <Field label="Pincode" id="pincode" required>
            <Input id="pincode" value={data.pincode} onChange={e => set('pincode', e.target.value)}
              placeholder="6-digit" maxLength={6} />
          </Field>
        </div>
      </div>
    </div>
  );
};

// ── STEP 2: Guardian Info ─────────────────────────────────────────────────────
const Step2 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => (
  <div className="space-y-5">
    {/* Father */}
    <div className="p-4 rounded-2xl" style={{ background: '#e8f0fb', border: '1px solid #9dbcee' }}>
      <p className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: '#1a5dc9' }}>
        👨 Father's Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Father's Name" id="fatherName" required>
          <Input id="fatherName" value={data.fatherName} onChange={e => set('fatherName', e.target.value)}
            placeholder="Full name" />
        </Field>
        <Field label="Mobile" id="fatherMobile" required>
          <Input id="fatherMobile" type="tel" value={data.fatherMobile}
            onChange={e => set('fatherMobile', e.target.value)} placeholder="10-digit" maxLength={10} />
        </Field>
        <Field label="WhatsApp" id="fatherWhatsapp">
          <Input id="fatherWhatsapp" type="tel" value={data.fatherWhatsapp}
            onChange={e => set('fatherWhatsapp', e.target.value)} placeholder="If different" maxLength={10} />
        </Field>
        <Field label="Occupation" id="fatherOccupation">
          <Input id="fatherOccupation" value={data.fatherOccupation}
            onChange={e => set('fatherOccupation', e.target.value)} placeholder="e.g. Business" />
        </Field>
      </div>
    </div>

    {/* Mother */}
    <div className="p-4 rounded-2xl" style={{ background: '#fdf2f8', border: '1px solid #f0abfc' }}>
      <p className="text-xs font-black mb-3 flex items-center gap-2 text-purple-700">
        👩 Mother's Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Mother's Name" id="motherName">
          <Input id="motherName" value={data.motherName} onChange={e => set('motherName', e.target.value)}
            placeholder="Full name" />
        </Field>
        <Field label="Mobile" id="motherMobile">
          <Input id="motherMobile" type="tel" value={data.motherMobile}
            onChange={e => set('motherMobile', e.target.value)} placeholder="10-digit" maxLength={10} />
        </Field>
        <Field label="Occupation" id="motherOccupation">
          <Input id="motherOccupation" value={data.motherOccupation}
            onChange={e => set('motherOccupation', e.target.value)} placeholder="e.g. Homemaker" />
        </Field>
      </div>
    </div>

    {/* Guardian (optional) */}
    <div className="p-4 rounded-2xl" style={{ background: '#f7f8f9', border: '1px solid #e5e7eb' }}>
      <p className="text-xs font-black mb-3 text-gray-500">
        👥 Other Guardian (Optional)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Name" id="guardianName">
          <Input id="guardianName" value={data.guardianName} onChange={e => set('guardianName', e.target.value)}
            placeholder="Full name" />
        </Field>
        <Field label="Mobile" id="guardianMobile">
          <Input id="guardianMobile" type="tel" value={data.guardianMobile}
            onChange={e => set('guardianMobile', e.target.value)} placeholder="10-digit" maxLength={10} />
        </Field>
        <Field label="Relation" id="guardianRelation">
          <Select id="guardianRelation" value={data.guardianRelation}
            onChange={e => set('guardianRelation', e.target.value)}>
            <option value="">Select</option>
            <option value="UNCLE">Uncle</option>
            <option value="AUNT">Aunt</option>
            <option value="GRANDPARENT">Grandparent</option>
            <option value="SIBLING">Sibling</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>
      </div>
    </div>
  </div>
);

// ── STEP 3: Academic Info ─────────────────────────────────────────────────────
const Step3 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Class" id="class" required>
        <Select id="class" value={data.class} onChange={e => set('class', e.target.value)}>
          <option value="">Select class</option>
          {['IX','X','XI','XII'].map(c => <option key={c} value={c}>Class {c}</option>)}
        </Select>
      </Field>

      <Field label="Board" id="board" required>
        <Select id="board" value={data.board} onChange={e => set('board', e.target.value)}>
          <option value="">Select board</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
          <option value="BSEB">BSEB (Bihar Board)</option>
          <option value="STATE">Other State Board</option>
          <option value="IB">IB</option>
        </Select>
      </Field>

      <Field label="Target Exam" id="targetExam" required>
        <Select id="targetExam" value={data.targetExam} onChange={e => set('targetExam', e.target.value)}>
          <option value="">Select target</option>
          <option value="JEE">JEE (Mains + Advanced)</option>
          <option value="NEET">NEET UG</option>
          <option value="BOARD">Board Exam Only</option>
          <option value="FOUNDATION">Foundation (Class 9/10)</option>
        </Select>
      </Field>

      <Field label="Academic Year" id="academicYear" required>
        <Select id="academicYear" value={data.academicYear} onChange={e => set('academicYear', e.target.value)}>
          <option value="2024-25">2024–25</option>
          <option value="2025-26">2025–26</option>
          <option value="2026-27">2026–27</option>
        </Select>
      </Field>

      <Field label="Study Mode" id="mode" required>
        <Select id="mode" value={data.mode} onChange={e => set('mode', e.target.value)}>
          <option value="OFFLINE">Offline (Centre)</option>
          <option value="ONLINE">Online</option>
          <option value="HYBRID">Hybrid</option>
        </Select>
      </Field>
    </div>

    {/* Previous Academic */}
    <div className="p-4 rounded-2xl border" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
      <p className="text-xs font-black mb-3 text-amber-700 flex items-center gap-1.5">
        <BookOpen size={13} /> Previous Academic History
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Previous School" id="prevSchool">
          <Input id="prevSchool" value={data.prevSchool} onChange={e => set('prevSchool', e.target.value)}
            placeholder="School name" />
        </Field>
        <Field label="Previous Class" id="prevClass">
          <Select id="prevClass" value={data.prevClass} onChange={e => set('prevClass', e.target.value)}>
            <option value="">Select</option>
            {['VIII','IX','X','XI'].map(c => <option key={c} value={c}>Class {c}</option>)}
          </Select>
        </Field>
        <Field label="Previous Board" id="prevBoard">
          <Select id="prevBoard" value={data.prevBoard} onChange={e => set('prevBoard', e.target.value)}>
            <option value="">Select</option>
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="STATE">State Board</option>
          </Select>
        </Field>
        <Field label="Previous Score (%)" id="prevPercent">
          <Input id="prevPercent" type="number" value={data.prevPercent}
            onChange={e => set('prevPercent', e.target.value)} placeholder="e.g. 85.6" min="0" max="100" />
        </Field>
      </div>
    </div>
  </div>
);

// ── STEP 4: Batch Enrollment ──────────────────────────────────────────────────
const Step4 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => {
  const [batches, setBatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/coaching/academic/batches');
        if (res.data && res.data.data && Array.isArray(res.data.data.items)) {
          setBatches(res.data.data.items);
        } else if (Array.isArray(res.data)) {
          setBatches(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Select the batch this student will be enrolled in. Each batch has limited capacity.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading batches...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {batches.map((b: any) => {
            const selected = data.batchId === b.id;
            const color = '#1a5dc9'; // Default color
            return (
              <button key={b.id} onClick={() => { set('batchId', b.id); set('batchName', b.name); }}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  selected ? 'shadow-md' : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
                style={selected ? { borderColor: color, background: `${color}10` } : {}}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold" style={{ color: selected ? color : '#0d1b3e' }}>{b.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Capacity {b.capacity}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    selected ? 'border-transparent' : 'border-gray-300'
                  }`}
                    style={selected ? { background: color } : {}}>
                    {selected && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {data.batchId && (
      <div className="mt-4">
        <Field label="Roll Number (optional)" id="rollNo">
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input id="rollNo" value={data.rollNo} onChange={e => set('rollNo', e.target.value)}
              placeholder="Auto-assigned if empty" className="pl-9" />
          </div>
        </Field>
      </div>
    )}
  </div>
  );
};

// ── STEP 5: Documents ─────────────────────────────────────────────────────────
const DOC_TYPES = [
  { key: 'aadhar',     label: 'Aadhar Card', required: true  },
  { key: 'photo',      label: 'Passport Photo (2 copies)', required: true  },
  { key: 'marksheet',  label: 'Previous Marksheet', required: false },
  { key: 'school_id',  label: 'School ID Card', required: false },
  { key: 'birth_cert', label: 'Birth Certificate', required: false },
];

const Step5 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => (
  <div className="space-y-3">
    <p className="text-xs text-gray-500">Upload scanned copies of required documents (PDF or JPG, max 5MB each).</p>
    {DOC_TYPES.map(doc => {
      const file = data.docs[doc.key];
      return (
        <div key={doc.key} className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
          style={{ background: file ? '#ecfdf5' : '#fafafa', borderColor: file ? '#6ee7b7' : '#e5e7eb' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: file ? '#d1fae5' : '#e8f0fb' }}>
            <FileText size={18} style={{ color: file ? '#059669' : '#1a5dc9' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#0d1b3e' }}>
              {doc.label}
              {doc.required && <span className="text-red-500 text-[10px]">*Required</span>}
            </p>
            {file
              ? <p className="text-xs text-emerald-600 truncate">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
              : <p className="text-xs text-gray-400">No file selected</p>
            }
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {file && (
              <button onClick={() => set('docs', { ...data.docs, [doc.key]: null })}
                className="p-1.5 rounded-lg hover:bg-red-50">
                <X size={14} className="text-red-500" />
              </button>
            )}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-white"
              style={{ background: '#1a5dc9' }}>
              <Upload size={12} /> {file ? 'Change' : 'Upload'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) set('docs', { ...data.docs, [doc.key]: f });
                }} />
            </label>
          </div>
        </div>
      );
    })}

    <div className="flex items-start gap-2 p-3 rounded-xl mt-2"
      style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700">
        Documents can also be uploaded later from the student's profile page.
        Only Aadhar and Photo are required at admission time.
      </p>
    </div>
  </div>
);

// ── Review / Confirm ──────────────────────────────────────────────────────────
const StepReview = ({ data }: { data: FormData }) => {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg,#001233,#001845)', border: '1px solid rgba(26,93,201,0.3)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)' }}>
            {data.fullName ? data.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'ST'}
          </div>
          <div>
            <p className="text-lg font-black text-white">{data.fullName || '—'}</p>
            <p className="text-sm" style={{ color: '#9dbcee' }}>
              {data.class && `Class ${data.class}`}{data.board && ` · ${data.board}`}{data.targetExam && ` · ${data.targetExam}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['DOB', data.dob], ['Mobile', data.mobile], ['City', data.city],
            ['Father', data.fatherName], ['Father Mobile', data.fatherMobile],
            ['Mode', data.mode], ['Batch', data.batchName || '—'], ['Status', data.status],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span style={{ color: 'rgba(157,188,238,0.6)' }} className="flex-shrink-0">{k}:</span>
              <span className="text-white font-semibold truncate">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
        style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }}>
        <Check size={14} strokeWidth={3} /> Review the details above and click <strong>Submit Admission</strong>.
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const AddStudent = () => {
  const [step, setStep]   = useState(1);
  const [data, setData]   = useState<FormData>(INIT);
  const [done, setDone]   = useState(false);
  const navigate          = useNavigate();

  const set = (k: keyof FormData, v: any) => setData(prev => ({ ...prev, [k]: v }));

  const canNext = () => {
    if (step === 1) return data.fullName.trim() && data.mobile.trim() && data.gender && data.class === '' === false;
    if (step === 2) return data.fatherName.trim() && data.fatherMobile.trim();
    if (step === 3) return data.class && data.board && data.targetExam;
    if (step === 4) return !!data.batchId;
    return true;
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: data.fullName,
        phone: data.mobile,
        email: data.email || undefined,
        passwordHash: data.mobile, // Use mobile as default password
        isActive: data.status === 'ACTIVE',
        profileData: {
          studentType: data.mode as 'OFFLINE' | 'ONLINE' | 'HYBRID',
          rollNo: data.rollNo || undefined,
          enrollmentNo: undefined,
        },
        batchId: data.batchId || undefined,
        address: data.address ? {
          street: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        } : undefined,
        guardians: data.fatherName ? [
          {
            name: data.fatherName,
            relation: 'FATHER',
            phone: data.fatherMobile,
            isPrimary: true,
          },
          ...(data.motherName ? [{
            name: data.motherName,
            relation: 'MOTHER',
            phone: data.motherMobile,
            isPrimary: false,
          }] : []),
        ] : [],
        history: data.prevSchool ? [{
          previousSchool: data.prevSchool,
          lastClass: data.prevClass,
          percentage: data.prevPercent ? parseFloat(data.prevPercent) : undefined,
        }] : [],
      };

      await api.post('/coaching/users/students', payload);
      setDone(true);
      setTimeout(() => navigate('..'), 2000);
    } catch (err: any) {
      console.error('Failed to create student:', err);
      alert(err?.response?.data?.error || 'Failed to create student. Please try again.');
    }
  };


  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
            <Check size={28} style={{ color: '#059669' }} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black" style={{ color: '#0d1b3e' }}>Admission Successful!</h2>
          <p className="text-sm text-gray-400">Student has been admitted. Redirecting…</p>
        </div>
      </div>
    );
  }

  const totalSteps = STEPS.length + 1; // +1 for review

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="cx-animate-in flex items-center gap-4">
        <Link to=".." className="p-2 rounded-xl border transition-all hover:border-blue-300" style={{ borderColor: '#dce8f7' }}>
          <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>New Student Admission</h1>
          <p className="text-xs text-gray-400">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="cx-animate-in flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done   = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  done ? 'text-white' : active ? 'text-white' : 'bg-white border-2'
                }`}
                  style={{
                    background: done ? '#059669' : active ? '#1a5dc9' : 'white',
                    border: done ? 'none' : active ? 'none' : '2px solid #dce8f7',
                    boxShadow: active ? '0 0 0 4px rgba(26,93,201,0.15)' : 'none'
                  }}>
                  {done ? <Check size={14} strokeWidth={3} /> : <s.icon size={14} className={active ? '' : 'text-gray-400'} />}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${active ? '' : done ? 'text-emerald-600' : 'text-gray-400'}`}
                  style={active ? { color: '#1a5dc9' } : {}}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1" style={{ background: step > s.id ? '#059669' : '#dce8f7' }} />
              )}
            </React.Fragment>
          );
        })}
        {/* Review step */}
        <div className="flex-1 h-0.5 mx-1" style={{ background: step > STEPS.length ? '#059669' : '#dce8f7' }} />
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all`}
            style={{
              background: step === totalSteps ? '#f5a623' : 'white',
              border: step === totalSteps ? 'none' : '2px solid #dce8f7',
              boxShadow: step === totalSteps ? '0 0 0 4px rgba(245,166,35,0.15)' : 'none'
            }}>
            <Check size={14} className={step === totalSteps ? 'text-white' : 'text-gray-400'} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-bold hidden sm:block" style={{ color: step === totalSteps ? '#f5a623' : '#9ca3af' }}>
            Review
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="cx-card cx-animate-in-2">
        <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: '#dce8f7' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: step <= STEPS.length ? 'linear-gradient(135deg,#1a5dc9,#0e3578)' : 'linear-gradient(135deg,#f5a623,#d97706)' }}>
              {step <= STEPS.length
                ? React.createElement(STEPS[step - 1].icon, { size: 16 })
                : <Check size={16} />
              }
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: '#0d1b3e' }}>
                {step <= STEPS.length ? STEPS[step - 1].label : 'Review & Submit'}
              </p>
              <p className="text-[11px] text-gray-400">
                {step <= STEPS.length ? STEPS[step - 1].desc : 'Confirm student details'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <Step4 data={data} set={set} />}
          {step === 5 && <Step5 data={data} set={set} />}
          {step === 6 && <StepReview data={data} />}
        </div>

        {/* Nav buttons */}
        <div className="px-6 pb-5 flex items-center justify-between border-t pt-4" style={{ borderColor: '#dce8f7' }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-300"
            style={{ borderColor: '#dce8f7', color: '#0d1b3e' }}>
            <ChevronLeft size={16} /> Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#1a5dc9,#0e3578)', boxShadow: '0 4px 12px rgba(26,93,201,0.35)' }}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.35)' }}>
              <Check size={16} strokeWidth={3} /> Submit Admission
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
