import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Check, User, Briefcase, GraduationCap,
  FileText, Upload, Camera, AlertCircle, X, Phone, Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal',     icon: User,          desc: 'Basic info & photo' },
  { id: 2, label: 'Professional', icon: Briefcase,     desc: 'Experience & subjects' },
  { id: 3, label: 'Employment',   icon: FileText,      desc: 'Role & documents' },
];

// ── Form data model ───────────────────────────────────────────────────────────
const INIT = {
  // Step 1 — Personal
  fullName: '', dob: '', gender: '', mobile: '', email: '',
  address: '', city: '', state: '', pincode: '',
  photo: null as File | null,

  // Step 2 — Professional
  highestQualification: '', university: '', passYear: '',
  subjects: [] as string[], experienceYears: '', previousInstitute: '',
  achievements: '',

  // Step 3 — Employment
  empType: 'FULL_TIME', joiningDate: '', salary: '',
  docs: {} as Record<string, File | null>,
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

const SUBJECT_OPTIONS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'Computer Science', 'Social Studies'];

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
            style={{ background: preview ? 'transparent' : '#fef2f2', border: '2px dashed #fca5a5' }}>
            {preview
              ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
              : <Camera size={22} style={{ color: '#cc2529' }} />
            }
          </div>
          <label htmlFor="photo-upload"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-white"
            style={{ background: '#cc2529' }}>
            <Upload size={12} />
          </label>
          <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0d1b3e' }}>Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">Professional photo. JPG/PNG max 2MB.</p>
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
            placeholder="e.g. Alok Ranjan" />
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

        <Field label="Mobile Number" id="mobile" required>
          <Input id="mobile" type="tel" value={data.mobile} onChange={e => set('mobile', e.target.value)}
            placeholder="10-digit mobile no." maxLength={10} />
        </Field>

        <Field label="Email Address" id="email" required>
          <Input id="email" type="email" value={data.email} onChange={e => set('email', e.target.value)}
            placeholder="Official/Personal email" />
        </Field>
      </div>
    </div>
  );
};

// ── STEP 2: Professional & Academic ───────────────────────────────────────────
const Step2 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => {
  const toggleSubject = (s: string) => {
    if (data.subjects.includes(s)) {
      set('subjects', data.subjects.filter(sub => sub !== s));
    } else {
      set('subjects', [...data.subjects, s]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Highest Qualification" id="highestQualification" required>
          <Select id="highestQualification" value={data.highestQualification} onChange={e => set('highestQualification', e.target.value)}>
            <option value="">Select qualification</option>
            <option value="B.Tech">B.Tech / B.E.</option>
            <option value="M.Tech">M.Tech / M.E.</option>
            <option value="B.Sc">B.Sc.</option>
            <option value="M.Sc">M.Sc.</option>
            <option value="Ph.D">Ph.D.</option>
            <option value="B.Ed">B.Ed.</option>
            <option value="Other">Other</option>
          </Select>
        </Field>

        <Field label="University/College" id="university" required>
          <Input id="university" value={data.university} onChange={e => set('university', e.target.value)}
            placeholder="e.g. IIT Delhi" />
        </Field>

        <Field label="Passing Year" id="passYear">
          <Input id="passYear" type="number" value={data.passYear} onChange={e => set('passYear', e.target.value)}
            placeholder="YYYY" maxLength={4} />
        </Field>

        <Field label="Total Experience (Years)" id="experienceYears" required>
          <Input id="experienceYears" type="number" value={data.experienceYears} onChange={e => set('experienceYears', e.target.value)}
            placeholder="e.g. 5" min="0" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Previous Institute" id="previousInstitute">
            <Input id="previousInstitute" value={data.previousInstitute} onChange={e => set('previousInstitute', e.target.value)}
              placeholder="If any..." />
          </Field>
        </div>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: '#dce8f7' }}>
        <p className="text-xs font-bold text-gray-600 mb-2">Teaching Subjects <span className="text-red-500">*</span></p>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map(s => {
            const isSelected = data.subjects.includes(s);
            return (
              <button key={s}
                onClick={() => toggleSubject(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                }`}
                style={isSelected ? { background: '#cc2529' } : {}}>
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── STEP 3: Employment ────────────────────────────────────────────────────────
const Step3 = ({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Employment Type" id="empType" required>
        <Select id="empType" value={data.empType} onChange={e => set('empType', e.target.value)}>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="GUEST">Guest Faculty</option>
        </Select>
      </Field>

      <Field label="Date of Joining" id="joiningDate" required>
        <Input id="joiningDate" type="date" value={data.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
      </Field>

      <Field label="Base Salary (₹)" id="salary">
        <Input id="salary" type="number" value={data.salary} onChange={e => set('salary', e.target.value)}
          placeholder="Monthly salary (Optional)" />
      </Field>
    </div>

    <div className="pt-4 border-t" style={{ borderColor: '#dce8f7' }}>
      <p className="text-xs font-bold text-gray-600 mb-3">Upload Documents</p>
      
      <div className="space-y-3">
        {[
          { key: 'resume', label: 'Resume / CV', required: true },
          { key: 'pan', label: 'PAN Card', required: true },
          { key: 'degree', label: 'Highest Degree Certificate', required: false },
        ].map(doc => {
          const file = data.docs[doc.key];
          return (
            <div key={doc.key} className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
              style={{ background: file ? '#ecfdf5' : '#fafafa', borderColor: file ? '#6ee7b7' : '#e5e7eb' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: file ? '#d1fae5' : '#fef2f2' }}>
                <FileText size={18} style={{ color: file ? '#059669' : '#cc2529' }} />
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
                  style={{ background: '#cc2529' }}>
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
      </div>
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
            style={{ background: 'linear-gradient(135deg,#cc2529,#a81e22)' }}>
            {data.fullName ? data.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'TR'}
          </div>
          <div>
            <p className="text-lg font-black text-white">{data.fullName || '—'}</p>
            <p className="text-sm flex flex-wrap gap-1" style={{ color: '#9dbcee' }}>
              {data.subjects.length > 0 ? data.subjects.join(', ') : 'No subject'} · {data.highestQualification}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Mobile', data.mobile], ['Email', data.email],
            ['Type', data.empType.replace('_', ' ')], ['Exp.', `${data.experienceYears} Years`],
            ['Joining', data.joiningDate], ['University', data.university],
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
        <Check size={14} strokeWidth={3} /> Review the details and submit to register the teacher.
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const AddTeacher = () => {
  const [step, setStep]   = useState(1);
  const [data, setData]   = useState<FormData>(INIT);
  const [done, setDone]   = useState(false);
  const navigate          = useNavigate();

  const set = (k: keyof FormData, v: any) => setData(prev => ({ ...prev, [k]: v }));

  const canNext = () => {
    if (step === 1) return data.fullName.trim() && data.mobile.trim() && data.email.trim() && data.gender;
    if (step === 2) return data.highestQualification && data.university && data.experienceYears !== '' && data.subjects.length > 0;
    if (step === 3) return data.empType && data.joiningDate;
    return true;
  };

  const handleSubmit = () => {
    setDone(true);
    setTimeout(() => navigate('..'), 2000);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
            <Check size={28} style={{ color: '#059669' }} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black" style={{ color: '#0d1b3e' }}>Registration Successful!</h2>
          <p className="text-sm text-gray-400">Teacher profile has been created. Redirecting…</p>
        </div>
      </div>
    );
  }

  const totalSteps = STEPS.length + 1; // +1 for review

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="cx-animate-in flex items-center gap-4">
        <Link to=".." className="p-2 rounded-xl border transition-all hover:border-red-300" style={{ borderColor: '#dce8f7' }}>
          <ChevronLeft size={18} style={{ color: '#cc2529' }} />
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>New Teacher Registration</h1>
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
                    background: done ? '#059669' : active ? '#cc2529' : 'white',
                    border: done ? 'none' : active ? 'none' : '2px solid #fef2f2',
                    boxShadow: active ? '0 0 0 4px rgba(204,37,41,0.15)' : 'none'
                  }}>
                  {done ? <Check size={14} strokeWidth={3} /> : <s.icon size={14} className={active ? '' : 'text-gray-400'} />}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${active ? '' : done ? 'text-emerald-600' : 'text-gray-400'}`}
                  style={active ? { color: '#cc2529' } : {}}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1" style={{ background: step > s.id ? '#059669' : '#fef2f2' }} />
              )}
            </React.Fragment>
          );
        })}
        {/* Review step */}
        <div className="flex-1 h-0.5 mx-1" style={{ background: step > STEPS.length ? '#059669' : '#fef2f2' }} />
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all`}
            style={{
              background: step === totalSteps ? '#f5a623' : 'white',
              border: step === totalSteps ? 'none' : '2px solid #fef2f2',
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
              style={{ background: step <= STEPS.length ? 'linear-gradient(135deg,#cc2529,#a81e22)' : 'linear-gradient(135deg,#f5a623,#d97706)' }}>
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
                {step <= STEPS.length ? STEPS[step - 1].desc : 'Confirm teacher details'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <StepReview data={data} />}
        </div>

        {/* Nav buttons */}
        <div className="px-6 pb-5 flex items-center justify-between border-t pt-4" style={{ borderColor: '#dce8f7' }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-300"
            style={{ borderColor: '#dce8f7', color: '#0d1b3e' }}>
            <ChevronLeft size={16} /> Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#cc2529,#a81e22)', boxShadow: '0 4px 12px rgba(204,37,41,0.35)' }}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.35)' }}>
              <Check size={16} strokeWidth={3} /> Submit Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
