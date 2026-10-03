import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight,
  BookOpen, FileQuestion, Layers, Tag, AlertTriangle, MoreVertical, Upload, Sparkles
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { BulkImportModal } from './BulkImportModal';
import { AIGenerateModal } from './AIGenerateModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HARD: 'bg-red-50 text-red-700 border-red-200',
};

export const QuestionBank: React.FC = () => {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);

  // Derived taxonomy from boards
  const classes = selectedClass
    ? []
    : boards.flatMap((b: any) => b.classes || []);
  const allClasses = boards.flatMap((b: any) => b.classes || []);
  const subjects = allClasses.find((c: any) => c.id === selectedClass)?.subjects || [];
  const chapters = subjects.find((s: any) => s.id === selectedSubject)?.chapters || [];
  const topics = chapters.find((ch: any) => ch.id === selectedChapter)?.topics || [];

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch(`${API}/coaching/questions/boards`, { headers });
      if (res.ok) setBoards(await res.json());
    } catch {}
  }, [token]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (difficulty) params.set('difficulty', difficulty);
      if (topicFilter) params.set('topicId', topicFilter);
      const res = await fetch(`${API}/coaching/questions?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {}
    setLoading(false);
  }, [token, page, search, difficulty, topicFilter]);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setDeleting(id);
    try {
      await fetch(`${API}/coaching/questions/${id}`, { method: 'DELETE', headers });
      fetchQuestions();
    } catch {}
    setDeleting(null);
    setOpenMenu(null);
  };

  // Debounced search
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="cx-animate-in flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0d1b3e' }}>Question Bank</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} question{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAIGenerate(true)}
            className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-sm font-semibold hover:bg-purple-100 flex items-center gap-2 transition-colors"
          >
            <Sparkles size={16} /> Generate AI
          </button>
          <button 
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload size={16} /> Bulk Import
          </button>
          <Link to="add" className="cx-btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Question
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="cx-card p-4 cx-animate-in-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="cx-input pl-9 text-sm w-full"
              placeholder="Search questions..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="cx-input text-sm" value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <select className="cx-input text-sm" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedChapter(''); setTopicFilter(''); setPage(1); }}>
            <option value="">All Classes</option>
            {allClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedClass ? (
            <select className="cx-input text-sm" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); setTopicFilter(''); setPage(1); }}>
              <option value="">All Subjects</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          ) : (
            <button className="cx-btn-secondary text-sm flex items-center gap-2" onClick={() => { setSearch(''); setDifficulty(''); setTopicFilter(''); setSelectedClass(''); setPage(1); }}>
              <Filter size={14} /> Clear Filters
            </button>
          )}
        </div>
        {selectedSubject && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <select className="cx-input text-sm" value={selectedChapter} onChange={e => { setSelectedChapter(e.target.value); setTopicFilter(''); setPage(1); }}>
              <option value="">All Chapters</option>
              {chapters.map((ch: any) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
            </select>
            {selectedChapter && (
              <select className="cx-input text-sm" value={topicFilter} onChange={e => { setTopicFilter(e.target.value); setPage(1); }}>
                <option value="">All Topics</option>
                {topics.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="cx-animate-in-3 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cx-card p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : questions.length === 0 ? (
          <div className="cx-card p-16 text-center">
            <FileQuestion size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No questions found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting filters or add your first question.</p>
            <Link to="add" className="cx-btn-primary inline-flex items-center gap-2 mt-6 text-sm">
              <Plus size={15} /> Add Question
            </Link>
          </div>
        ) : questions.map((q: any, idx: number) => {
          const breadcrumb = q.topic
            ? [q.topic?.chapter?.subject?.class?.board?.name, q.topic?.chapter?.subject?.name, q.topic?.chapter?.name, q.topic?.name].filter(Boolean).join(' › ')
            : null;
          const correctOptions = q.options?.filter((o: any) => o.isCorrect) || [];

          return (
            <div key={q.id} className="cx-card p-5 hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-4">
                {/* Index */}
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-black text-blue-700 flex-shrink-0 mt-0.5">
                  {(page - 1) * 15 + idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Question text */}
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed line-clamp-2">{q.text}</p>

                  {/* Breadcrumb */}
                  {breadcrumb && (
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <Layers size={11} /> {breadcrumb}
                    </p>
                  )}

                  {/* Options preview */}
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options.map((opt: any) => (
                        <span
                          key={opt.id}
                          className={`text-[11px] px-2 py-0.5 rounded border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                        >
                          {opt.isCorrect ? '✓ ' : ''}{opt.text?.slice(0, 40)}{opt.text?.length > 40 ? '…' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.MEDIUM}`}>
                      {q.difficulty}
                    </span>
                    {q.questionType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 border-blue-200 text-blue-700">
                        {q.questionType.replace('_', ' ')}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">+{parseFloat(q.marks)}m</span>
                    {parseFloat(q.negativeMarks) > 0 && (
                      <span className="text-[11px] text-red-400 flex items-center gap-0.5">
                        <AlertTriangle size={10} /> -{parseFloat(q.negativeMarks)}
                      </span>
                    )}
                    {q.expectedTime && (
                      <span className="text-[11px] text-gray-500">⏱️ {q.expectedTime}s</span>
                    )}
                    {q.tags?.map((tag: any) => (
                      <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full border bg-purple-50 border-purple-200 text-purple-700 flex items-center gap-1">
                        <Tag size={9} /> {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0">
                  <button
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    onClick={() => setOpenMenu(openMenu === q.id ? null : q.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === q.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-36 overflow-hidden">
                      <Link
                        to={`${q.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(q.id)}
                        disabled={deleting === q.id}
                      >
                        <Trash2 size={14} /> {deleting === q.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between cx-animate-in-4">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="cx-btn-secondary text-xs p-2"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${pg === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              );
            })}
            <button
              className="cx-btn-secondary text-xs p-2"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
      
      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal 
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            setShowBulkImport(false);
            fetchQuestions();
          }}
        />
      )}

      {/* AI Generate Modal */}
      {showAIGenerate && (
        <AIGenerateModal
          onClose={() => setShowAIGenerate(false)}
          onSuccess={() => {
            setShowAIGenerate(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
};
