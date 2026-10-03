import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, CheckCircle2, AlertCircle, Image, BookOpen } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD', 'CHALLENGE'];
const QUESTION_TYPES = ['OBJECTIVE', 'SUBJECTIVE', 'NUMERICAL', 'VVI', 'PYQ', 'BOARD_PATTERN', 'JEE'];

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface FormState {
  text: string;
  questionType: string;
  difficulty: string;
  marks: string;
  negativeMarks: string;
  expectedTime: string;
  topicId: string;
  subtopicId: string;
  conceptId: string;
  categoryId: string;
  solution: string;
  stepByStepSolution: string;
  hint: string;
  conceptUsed: string;
  commonMistake: string;
  tags: string;
  attachments: { url: string; type: string }[];
  options: Option[];
}

const EMPTY_OPTION = (): Option => ({ text: '', isCorrect: false });

const defaultForm = (): FormState => ({
  text: '',
  questionType: 'OBJECTIVE',
  difficulty: 'MEDIUM',
  marks: '4',
  negativeMarks: '1',
  expectedTime: '120',
  topicId: '',
  subtopicId: '',
  conceptId: '',
  categoryId: '',
  solution: '',
  stepByStepSolution: '',
  hint: '',
  conceptUsed: '',
  commonMistake: '',
  tags: '',
  attachments: [],
  options: [EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION()],
});

export const AddQuestion: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [form, setForm] = useState<FormState>(defaultForm());
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived taxonomy
  const allClasses = boards.flatMap((b: any) => b.classes || []);
  const subjects = allClasses.find((c: any) => c.id === selectedClass)?.subjects || [];
  const chapters = subjects.find((s: any) => s.id === selectedSubject)?.chapters || [];
  const topics = chapters.find((ch: any) => ch.id === selectedChapter)?.topics || [];
  const subtopics = topics.find((t: any) => t.id === form.topicId)?.subtopics || [];
  const concepts = subtopics.find((st: any) => st.id === form.subtopicId)?.concepts || [];

  const fetchTaxonomy = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`${API}/coaching/questions/boards`, { headers }),
        fetch(`${API}/coaching/questions/categories`, { headers }),
      ]);
      if (bRes.ok) setBoards(await bRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch {}
  }, [token]);

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API}/coaching/questions/${id}`, { headers });
      if (!res.ok) return;
      const q = await res.json();
      setForm({
        text: q.text || '',
        questionType: q.questionType || 'OBJECTIVE',
        difficulty: q.difficulty || 'MEDIUM',
        marks: String(q.marks || '4'),
        negativeMarks: String(q.negativeMarks || '1'),
        expectedTime: String(q.expectedTime || '120'),
        topicId: q.topicId || '',
        subtopicId: q.subtopicId || '',
        conceptId: q.conceptId || '',
        categoryId: q.categoryId || '',
        solution: q.solution || '',
        stepByStepSolution: q.stepByStepSolution || '',
        hint: q.hint || '',
        conceptUsed: q.conceptUsed || '',
        commonMistake: q.commonMistake || '',
        tags: q.tags?.map((t: any) => t.name).join(', ') || '',
        attachments: q.attachments || [],
        options: q.options?.length > 0
          ? q.options.map((o: any) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
          : [EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION(), EMPTY_OPTION()],
      });
      // also pre-fill selectors
      if (q.topic) {
        setSelectedChapter(q.topic.chapterId);
        if (q.topic.chapter) {
          setSelectedSubject(q.topic.chapter.subjectId);
          if (q.topic.chapter.subject) setSelectedClass(q.topic.chapter.subject.classId);
        }
      }
    } catch {}
  }, [id, token]);

  useEffect(() => { fetchTaxonomy(); }, [fetchTaxonomy]);
  useEffect(() => { if (isEdit) fetchQuestion(); }, [fetchQuestion, isEdit]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.text.trim()) e.text = 'Question text is required.';
    if (form.options.length < 2) e.options = 'At least 2 options required.';
    if (!form.options.some(o => o.isCorrect)) e.options = 'Mark at least one option as correct.';
    if (form.options.some(o => !o.text.trim())) e.options = 'All options must have text.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        marks: parseFloat(form.marks),
        negativeMarks: parseFloat(form.negativeMarks),
        expectedTime: parseInt(form.expectedTime) || 120,
        options: form.options.map(({ id: _, ...o }) => o), // strip temp ids for create
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        attachments: form.attachments.map(({ url, type }) => ({ url, type })),
      };

      const url = isEdit ? `${API}/coaching/questions/${id}` : `${API}/coaching/questions`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });

      if (res.ok) {
        navigate('..', { relative: 'path' });
      } else {
        const data = await res.json();
        setErrors({ submit: data.error || 'Failed to save question.' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
    setSaving(false);
  };

  const setOption = (idx: number, key: keyof Option, value: any) => {
    setForm(prev => {
      const opts = [...prev.options];
      opts[idx] = { ...opts[idx], [key]: value };
      // Only one correct answer (for MCQ)
      if (key === 'isCorrect' && value === true) {
        opts.forEach((o, i) => { if (i !== idx) o.isCorrect = false; });
      }
      return { ...prev, options: opts };
    });
  };

  const addOption = () => setForm(prev => ({ ...prev, options: [...prev.options, EMPTY_OPTION()] }));
  const removeOption = (idx: number) => setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));

  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="cx-animate-in flex items-center gap-4">
        <Link to=".." relative="path" className="p-2 rounded-xl border transition-all hover:border-blue-300 bg-white" style={{ borderColor: '#dce8f7' }}>
          <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>
            {isEdit ? 'Edit Question' : 'Add New Question'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEdit ? 'Modify the question and its options' : 'Fill in the question details and options'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question Text */}
        <div className="cx-card p-6 cx-animate-in-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={15} className="text-blue-600" /> Question Text
          </h2>
          <div>
            <textarea
              className={`cx-input w-full min-h-[120px] text-sm leading-relaxed resize-y ${errors.text ? 'border-red-400' : ''}`}
              placeholder="Type your question here… (LaTeX supported: $x^2 + y^2 = z^2$)"
              value={form.text}
              onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
            />
            {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Type</label>
              <select
                className="cx-input text-sm w-full"
                value={form.questionType}
                onChange={e => setForm(prev => ({ ...prev, questionType: e.target.value }))}
              >
                {QUESTION_TYPES.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Difficulty</label>
              <select
                className="cx-input text-sm w-full"
                value={form.difficulty}
                onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Marks (+)</label>
              <input
                type="number" step="0.5" min="0"
                className="cx-input text-sm w-full"
                value={form.marks}
                onChange={e => setForm(prev => ({ ...prev, marks: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Negative Marks</label>
              <input
                type="number" step="0.25" min="0"
                className="cx-input text-sm w-full"
                value={form.negativeMarks}
                onChange={e => setForm(prev => ({ ...prev, negativeMarks: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Expected Time (s)</label>
              <input
                type="number" step="10" min="0"
                className="cx-input text-sm w-full"
                value={form.expectedTime}
                onChange={e => setForm(prev => ({ ...prev, expectedTime: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Tags (comma separated)</label>
            <input
              type="text"
              className="cx-input text-sm w-full"
              placeholder="e.g. CBSE 2020, PYQ, Important"
              value={form.tags}
              onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>
        </div>

        {/* Taxonomy Mapping */}
        <div className="cx-card p-6 cx-animate-in-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-800">📚 Academic Mapping (Optional)</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Class</label>
              <select className="cx-input text-sm w-full" value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedChapter(''); setForm(p => ({ ...p, topicId: '', subtopicId: '', conceptId: '' })); }}>
                <option value="">Select Class</option>
                {allClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Subject</label>
              <select className="cx-input text-sm w-full" value={selectedSubject} disabled={!selectedClass}
                onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); setForm(p => ({ ...p, topicId: '', subtopicId: '', conceptId: '' })); }}>
                <option value="">Select Subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Chapter</label>
              <select className="cx-input text-sm w-full" value={selectedChapter} disabled={!selectedSubject}
                onChange={e => { setSelectedChapter(e.target.value); setForm(p => ({ ...p, topicId: '', subtopicId: '', conceptId: '' })); }}>
                <option value="">Select Chapter</option>
                {chapters.map((ch: any) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Topic</label>
              <select className="cx-input text-sm w-full" value={form.topicId} disabled={!selectedChapter}
                onChange={e => setForm(p => ({ ...p, topicId: e.target.value, subtopicId: '', conceptId: '' }))}>
                <option value="">Select Topic</option>
                {topics.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Subtopic</label>
              <select className="cx-input text-sm w-full" value={form.subtopicId} disabled={!form.topicId}
                onChange={e => setForm(p => ({ ...p, subtopicId: e.target.value, conceptId: '' }))}>
                <option value="">Select Subtopic</option>
                {subtopics.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Concept</label>
              <select className="cx-input text-sm w-full" value={form.conceptId} disabled={!form.subtopicId}
                onChange={e => setForm(p => ({ ...p, conceptId: e.target.value }))}>
                <option value="">Select Concept</option>
                {concepts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Category</label>
              <select className="cx-input text-sm w-full" value={form.categoryId}
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">No Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="cx-card p-6 cx-animate-in-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">
              ✅ Answer Options
              <span className="ml-2 text-xs font-normal text-gray-400">(click circle to mark correct)</span>
            </h2>
            <button type="button" onClick={addOption} className="cx-btn-secondary text-xs flex items-center gap-1 py-1 px-3">
              <Plus size={12} /> Add Option
            </button>
          </div>

          {errors.options && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={14} /> {errors.options}
            </div>
          )}

          <div className="space-y-3">
            {form.options.map((opt, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'}`}>
                {/* Correct toggle */}
                <button
                  type="button"
                  onClick={() => setOption(idx, 'isCorrect', !opt.isCorrect)}
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent hover:border-emerald-400'}`}
                >
                  <CheckCircle2 size={14} />
                </button>

                {/* Label */}
                <span className={`text-xs font-black w-5 flex-shrink-0 ${opt.isCorrect ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {OPTION_LABELS[idx] || idx + 1}
                </span>

                {/* Text */}
                <input
                  className={`flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 ${opt.isCorrect ? 'font-semibold' : ''}`}
                  placeholder={`Option ${OPTION_LABELS[idx] || idx + 1}…`}
                  value={opt.text}
                  onChange={e => setOption(idx, 'text', e.target.value)}
                />

                {/* Remove */}
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(idx)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Solution & Explanations */}
        <div className="cx-card p-6 cx-animate-in-3 space-y-4">
          <h2 className="text-sm font-bold text-gray-800">💡 Detailed Solution & Analysis</h2>
          
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Step-by-step Solution</label>
            <textarea
              className="cx-input w-full min-h-[100px] text-sm resize-y"
              placeholder="Explain the solution step-by-step… (supports LaTeX)"
              value={form.stepByStepSolution}
              onChange={e => setForm(prev => ({ ...prev, stepByStepSolution: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Hint</label>
              <textarea
                className="cx-input w-full min-h-[80px] text-sm resize-y"
                placeholder="A small hint for the student..."
                value={form.hint}
                onChange={e => setForm(prev => ({ ...prev, hint: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Concept Used</label>
              <textarea
                className="cx-input w-full min-h-[80px] text-sm resize-y"
                placeholder="Explain the core concept used..."
                value={form.conceptUsed}
                onChange={e => setForm(prev => ({ ...prev, conceptUsed: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 mb-1 block">Common Mistake</label>
              <textarea
                className="cx-input w-full min-h-[80px] text-sm resize-y"
                placeholder="What mistakes do students usually make here?"
                value={form.commonMistake}
                onChange={e => setForm(prev => ({ ...prev, commonMistake: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Media / Attachments */}
        <div className="cx-card p-6 cx-animate-in-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Image size={15} className="text-blue-600" /> Media & Attachments
            </h2>
          </div>
          
          <div className="space-y-3">
            {form.attachments.map((att, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 border rounded-xl bg-gray-50/50">
                <select className="cx-input text-sm w-full sm:w-32" value={att.type} onChange={e => {
                  const newAtt = [...form.attachments];
                  newAtt[i].type = e.target.value;
                  setForm(p => ({ ...p, attachments: newAtt }));
                }}>
                  <option value="IMAGE">Image</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                </select>
                <input 
                  type="text" 
                  className="cx-input text-sm flex-1" 
                  placeholder="https://example.com/image.png or upload a file" 
                  value={att.url} 
                  onChange={e => {
                    const newAtt = [...form.attachments];
                    newAtt[i].url = e.target.value;
                    setForm(p => ({ ...p, attachments: newAtt }));
                  }} 
                />
                <button type="button" className="p-2 text-red-500 hover:bg-red-50 rounded" onClick={() => {
                  const newAtt = form.attachments.filter((_, idx) => idx !== i);
                  setForm(p => ({ ...p, attachments: newAtt }));
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" className="cx-btn-secondary text-xs flex items-center gap-1" onClick={() => setForm(p => ({ ...p, attachments: [...p.attachments, { url: '', type: 'IMAGE' }] }))}>
              <Plus size={12} /> Add URL Manually
            </button>
            <div className="relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Optimistic add (loading state can be improved later)
                  const attIndex = form.attachments.length;
                  setForm(p => ({ ...p, attachments: [...p.attachments, { url: 'Uploading...', type: file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'VIDEO' : 'IMAGE' }] }));
                  
                  try {
                    const res = await fetch(`${API}/upload/presigned-url`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ filename: file.name, contentType: file.type })
                    });
                    
                    if (!res.ok) throw new Error('Failed to get presigned URL. Check if S3 is configured in backend.');
                    const { presignedUrl, publicUrl } = await res.json();
                    
                    const uploadRes = await fetch(presignedUrl, {
                      method: 'PUT',
                      headers: { 'Content-Type': file.type },
                      body: file
                    });
                    
                    if (!uploadRes.ok) throw new Error('Upload to S3 failed.');
                    
                    setForm(p => {
                      const newAtt = [...p.attachments];
                      newAtt[attIndex].url = publicUrl;
                      return { ...p, attachments: newAtt };
                    });
                  } catch (err: any) {
                    alert(err.message);
                    setForm(p => ({ ...p, attachments: p.attachments.filter((_, i) => i !== attIndex) }));
                  }
                }}
              />
              <button type="button" className="cx-btn-primary text-xs flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                <Image size={12} /> Upload File
              </button>
            </div>
          </div>
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={16} /> {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 cx-animate-in-4">
          <Link to=".." relative="path" className="cx-btn-secondary text-sm">Cancel</Link>
          <button type="submit" disabled={saving} className="cx-btn-primary text-sm min-w-[140px]">
            {saving ? 'Saving…' : isEdit ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
};
