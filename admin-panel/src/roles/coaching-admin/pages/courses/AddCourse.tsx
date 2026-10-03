import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Plus, BookOpen, Video, FileText, Check, LayoutGrid,
  Trash2, GripVertical, Upload, Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../api';
import axios from 'axios';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'NOTES' | 'PRACTICE';
  url: string;
  uploading: boolean;
}
interface Chapter { id: string; title: string; lessons: Lesson[]; }
interface Module  { id: string; title: string; chapters: Chapter[]; }

export const AddCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [step, setStep]               = useState(1);
  const [done, setDone]               = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(isEdit);
  const [saving, setSaving]           = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    title: '', subject: '', targetExam: 'JEE', status: 'DRAFT',
    description: '', price: '', validityDays: '',
  });

  const [modules, setModules] = useState<Module[]>([
    { id: 'm1', title: 'Module 1: Introduction', chapters: [] },
  ]);

  // ── Fetch existing course in edit mode ───────────────────────────────────
  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchCourse = async () => {
      setLoadingCourse(true);
      try {
        const { data } = await api.get(`/coaching/lms/courses/${id}`);
        setBasicInfo({
          title:        data.title || '',
          subject:      data.subject?.name || '',
          targetExam:   data.targetExam || 'JEE',
          status:       data.isPublished ? 'PUBLISHED' : 'DRAFT',
          description:  data.description || '',
          price:        data.price !== undefined ? String(data.price) : '',
          validityDays: data.validityDays != null ? String(data.validityDays) : '',
        });
        if (data.modules?.length > 0) {
          setModules(data.modules.map((m: any) => ({
            id: m.id, title: m.name || m.title || '',
            chapters: (m.chapters || []).map((c: any) => ({
              id: c.id, title: c.name || c.title || '',
              lessons: (c.lessons || []).map((l: any) => ({
                id: l.id, title: l.title || '',
                type: l.resources?.[0]?.type || 'VIDEO',
                url:  l.resources?.[0]?.url  || '',
                uploading: false,
              })),
            })),
          })));
        }
      } catch (err) {
        console.error('Failed to fetch course', err);
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  }, [id, isEdit]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addModule = () =>
    setModules(p => [...p, { id: `m${Date.now()}`, title: 'New Module', chapters: [] }]);

  const deleteModule = (mid: string) => {
    if (modules.length <= 1) return;
    setModules(p => p.filter(m => m.id !== mid));
  };

  const addChapter = (mid: string) =>
    setModules(p => p.map(m =>
      m.id !== mid ? m :
      { ...m, chapters: [...m.chapters, { id: `c${Date.now()}`, title: 'New Chapter', lessons: [] }] }
    ));

  const deleteChapter = (mid: string, cid: string) =>
    setModules(p => p.map(m =>
      m.id !== mid ? m : { ...m, chapters: m.chapters.filter(c => c.id !== cid) }
    ));

  const addLesson = (mid: string, cid: string, type: Lesson['type']) =>
    setModules(p => p.map(m =>
      m.id !== mid ? m : {
        ...m, chapters: m.chapters.map(c =>
          c.id !== cid ? c : {
            ...c, lessons: [...c.lessons, { id: `l${Date.now()}`, title: `New ${type}`, type, url: '', uploading: false }]
          }
        )
      }
    ));

  const deleteLesson = (mid: string, cid: string, lid: string) =>
    setModules(p => p.map(m =>
      m.id !== mid ? m : {
        ...m, chapters: m.chapters.map(c =>
          c.id !== cid ? c : { ...c, lessons: c.lessons.filter(l => l.id !== lid) }
        )
      }
    ));

  const updateLessonField = (mid: string, cid: string, lid: string, field: string, value: any) =>
    setModules(p => p.map(m =>
      m.id !== mid ? m : {
        ...m, chapters: m.chapters.map(c =>
          c.id !== cid ? c : { ...c, lessons: c.lessons.map(l => l.id !== lid ? l : { ...l, [field]: value }) }
        )
      }
    ));

  const handleFileUpload = async (mid: string, cid: string, lid: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    updateLessonField(mid, cid, lid, 'uploading', true);
    try {
      const { data } = await api.post('/upload/presigned-url', { filename: file.name, contentType: file.type });
      const uploadUrl = data.presignedUrl || data.uploadUrl;
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
      updateLessonField(mid, cid, lid, 'url', data.publicUrl || data.key || uploadUrl.split('?')[0]);
    } catch {
      alert('File upload failed. Please try again.');
    } finally {
      updateLessonField(mid, cid, lid, 'uploading', false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      name: basicInfo.title, title: basicInfo.title,
      description: basicInfo.description, status: basicInfo.status,
      price:        basicInfo.price        ? parseFloat(basicInfo.price)        : 0,
      validityDays: basicInfo.validityDays ? parseInt(basicInfo.validityDays)   : null,
      modules,
    };
    try {
      if (isEdit && id) {
        await api.put(`/coaching/lms/courses/${id}`, payload);
      } else {
        await api.post('/coaching/lms/courses', payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setDone(true);
      setTimeout(() => navigate('/courses'), 1500);
    }
  };

  // ── Loading / Done states ────────────────────────────────────────────────
  if (loadingCourse) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 size={32} className="animate-spin mx-auto text-blue-500" />
        <p className="text-sm text-gray-400">Course data load ho raha hai…</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
          <Check size={28} style={{ color: '#059669' }} strokeWidth={3} />
        </div>
        <h2 className="text-xl font-black" style={{ color: '#0d1b3e' }}>
          {isEdit ? 'Course Updated!' : 'Course Created!'}
        </h2>
        <p className="text-sm text-gray-400">
          {isEdit ? 'Changes saved successfully.' : 'The course has been saved as Draft.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="cx-animate-in flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl border transition-all hover:border-blue-300" style={{ borderColor: '#dce8f7' }}>
            <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
          </button>
          <div>
            <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>
              {isEdit ? 'Edit Course' : 'Course Builder'}
            </h1>
            <p className="text-xs text-gray-400">
              {step === 1 ? 'Step 1: Basic Details' : 'Step 2: Curriculum Builder'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="cx-btn-secondary text-xs">Back to Details</button>
          )}
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={saving}
            className="cx-btn-primary text-xs disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {step === 1 ? 'Next: Build Curriculum' : isEdit ? 'Save Changes' : 'Save & Publish Course'}
          </button>
        </div>
      </div>

      {step === 1 ? (
        /* ── Step 1: Basic Info ── */
        <div className="cx-card p-6 md:p-8 space-y-6 cx-animate-in-2">
          <h2 className="text-lg font-bold" style={{ color: '#0d1b3e' }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-600">Course Title <span className="text-red-500">*</span></label>
              <input type="text" className="cx-input w-full text-sm"
                placeholder="e.g. Complete Physics for JEE Advanced"
                value={basicInfo.title}
                onChange={e => setBasicInfo(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Subject</label>
              <select className="cx-input w-full text-sm cursor-pointer"
                value={basicInfo.subject} onChange={e => setBasicInfo(p => ({ ...p, subject: e.target.value }))}>
                <option value="">Select subject</option>
                <option>Physics</option><option>Chemistry</option>
                <option>Maths</option><option>Biology</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Target Exam</label>
              <select className="cx-input w-full text-sm cursor-pointer"
                value={basicInfo.targetExam} onChange={e => setBasicInfo(p => ({ ...p, targetExam: e.target.value }))}>
                <option value="JEE">JEE</option><option value="NEET">NEET</option>
                <option value="BOARD">BOARD</option><option value="BSEB Board 11th">BSEB Board 11th</option>
                <option value="BSEB Board 12th">BSEB Board 12th</option><option value="FOUNDATION">FOUNDATION</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Course Status</label>
              <select className="cx-input w-full text-sm cursor-pointer"
                value={basicInfo.status} onChange={e => setBasicInfo(p => ({ ...p, status: e.target.value }))}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Price (₹)</label>
              <input type="number" className="cx-input w-full text-sm"
                placeholder="0 = Free" value={basicInfo.price}
                onChange={e => setBasicInfo(p => ({ ...p, price: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Validity (Days)</label>
              <input type="number" className="cx-input w-full text-sm"
                placeholder="Blank = Lifetime" value={basicInfo.validityDays}
                onChange={e => setBasicInfo(p => ({ ...p, validityDays: e.target.value }))} />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-600">Description</label>
              <textarea className="cx-input w-full text-sm min-h-[100px]"
                placeholder="Briefly describe the course content..."
                value={basicInfo.description}
                onChange={e => setBasicInfo(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
        </div>

      ) : (
        /* ── Step 2: Curriculum Builder ── */
        <div className="space-y-4 cx-animate-in-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#0d1b3e' }}>Curriculum Structure</h2>
            <button onClick={addModule}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <Plus size={14} /> Add Module
            </button>
          </div>

          {modules.map(module => (
            <div key={module.id} className="cx-card border overflow-hidden" style={{ borderColor: '#dce8f7' }}>
              {/* Module header */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: '#dce8f7' }}>
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                  <input type="text" className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
                    value={module.title}
                    onChange={e => setModules(p => p.map(m => m.id === module.id ? { ...m, title: e.target.value } : m))} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => addChapter(module.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Plus size={12} /> Add Chapter
                  </button>
                  <button onClick={() => deleteModule(module.id)} disabled={modules.length <= 1}
                    title={modules.length <= 1 ? 'Kam se kam 1 module zaruri hai' : 'Module delete karo'}
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 bg-white">
                {module.chapters.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No chapters yet. "Add Chapter" click karo.</p>
                )}

                {module.chapters.map(chapter => (
                  <div key={chapter.id} className="ml-6 border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                    {/* Chapter header */}
                    <div className="bg-white px-3 py-2 flex items-center justify-between border-b" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center gap-2 flex-1">
                        <LayoutGrid size={14} className="text-emerald-500" />
                        <input type="text" className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full text-gray-700"
                          value={chapter.title}
                          onChange={e => setModules(p => p.map(m =>
                            m.id !== module.id ? m : {
                              ...m, chapters: m.chapters.map(c => c.id === chapter.id ? { ...c, title: e.target.value } : c)
                            }
                          ))} />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          {([
                            { t: 'VIDEO',    I: Video,    cl: 'hover:bg-red-50 text-red-500',         tt: 'Add Video' },
                            { t: 'PDF',      I: FileText, cl: 'hover:bg-blue-50 text-blue-500',       tt: 'Add PDF' },
                            { t: 'NOTES',    I: BookOpen, cl: 'hover:bg-amber-50 text-amber-500',     tt: 'Add Notes' },
                            { t: 'PRACTICE', I: Check,    cl: 'hover:bg-emerald-50 text-emerald-500', tt: 'Add Practice' },
                          ] as const).map(({ t, I, cl, tt }) => (
                            <button key={t} onClick={() => addLesson(module.id, chapter.id, t)}
                              className={`p-1 rounded bg-gray-100 ${cl}`} title={tt}>
                              <I size={12} />
                            </button>
                          ))}
                        </div>
                        <button onClick={() => deleteChapter(module.id, chapter.id)} title="Chapter delete karo"
                          className="ml-1 p-1 rounded text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="p-2 space-y-1.5 bg-[#f9fafb]">
                      {chapter.lessons.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic px-2">No lessons. Upar wale icons se add karo.</p>
                      )}
                      {chapter.lessons.map(lesson => (
                        <div key={lesson.id}
                          className="bg-white border px-3 py-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-2"
                          style={{ borderColor: '#f3f4f6' }}>
                          <div className="flex items-center gap-2">
                            {lesson.type === 'VIDEO'    && <Video    size={14} className="text-red-500" />}
                            {lesson.type === 'PDF'      && <FileText size={14} className="text-blue-500" />}
                            {lesson.type === 'NOTES'    && <BookOpen size={14} className="text-amber-500" />}
                            {lesson.type === 'PRACTICE' && <Check    size={14} className="text-emerald-500" />}
                            <input type="text"
                              className="bg-transparent border-none focus:ring-0 text-xs font-semibold text-gray-600 w-full sm:w-48"
                              value={lesson.title}
                              onChange={e => setModules(p => p.map(m =>
                                m.id !== module.id ? m : {
                                  ...m, chapters: m.chapters.map(c =>
                                    c.id !== chapter.id ? c : {
                                      ...c, lessons: c.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l)
                                    }
                                  )
                                }
                              ))} />
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.uploading ? (
                              <span className="text-[10px] px-2 py-0.5 text-blue-500 font-bold flex items-center gap-1">
                                <Loader2 size={10} className="animate-spin" /> Uploading...
                              </span>
                            ) : lesson.url ? (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded">✓ Uploaded</span>
                            ) : (
                              <label className="text-[10px] px-2 py-0.5 border rounded text-gray-500 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                                <Upload size={10} /> Upload
                                <input type="file" className="hidden"
                                  onChange={e => handleFileUpload(module.id, chapter.id, lesson.id, e)} />
                              </label>
                            )}
                            <button onClick={() => deleteLesson(module.id, chapter.id, lesson.id)}
                              title="Lesson delete karo"
                              className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

