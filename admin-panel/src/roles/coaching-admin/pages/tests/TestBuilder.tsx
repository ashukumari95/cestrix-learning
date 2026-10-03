import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Search, Filter, Trash2, Settings, PlusCircle } from 'lucide-react';
import api from '../../../../api';

interface TestBuilderProps {}

interface Section {
  id: string;
  name: string;
  questions: any[];
}

export const TestBuilder: React.FC<TestBuilderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const testId = queryParams.get('id');

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [marks, setMarks] = useState(100);
  const [isPublished, setIsPublished] = useState(false);

  // Sections
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Section A', questions: [] }
  ]);
  const [activeSectionId, setActiveSectionId] = useState<string>('1');

  // Question Bank
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  const loadTest = async (id: string) => {
    try {
      const res = await api.get(`/coaching/tests/${id}`);
      const test = res.data;
      setTitle(test.title || '');
      setDuration(test.durationMins || 60);
      setMarks(Number(test.totalMarks) || 100);
      setIsPublished(test.isPublished || false);
      
      if (test.sections && test.sections.length > 0) {
        const loadedSections = test.sections.map((sec: any) => ({
          id: sec.id,
          name: sec.name,
          questions: sec.questions.map((tq: any) => ({
            ...tq.question,
            marks: tq.question.marks,
            negativeMarks: tq.question.negativeMarks
          }))
        }));
        setSections(loadedSections);
        setActiveSectionId(loadedSections[0].id);
      } else if (test.questions && test.questions.length > 0) {
        // Backwards compatibility for flat questions
        setSections([
          { 
            id: '1', 
            name: 'Section A', 
            questions: test.questions.map((tq: any) => tq.question) 
          }
        ]);
        setActiveSectionId('1');
      }
    } catch (err) {
      console.error('Error loading test', err);
      alert('Failed to load test details.');
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coaching/questions?limit=50');
      setQuestions(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return alert('Test title is required');
    
    let totalQuestions = 0;
    sections.forEach(s => totalQuestions += s.questions.length);
    if (totalQuestions === 0) return alert('Please add at least one question');

    const payload = {
      title,
      durationMins: duration,
      totalMarks: marks,
      isPublished,
      sections: sections.map((sec, idx) => ({
        name: sec.name,
        order: idx + 1,
        questions: sec.questions.map((q, qIdx) => ({
          id: q.id,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          order: qIdx + 1
        }))
      }))
    };

    try {
      if (testId) {
        await api.put(`/coaching/tests/${testId}`, payload);
        alert('Test updated successfully!');
      } else {
        await api.post('/coaching/tests/create', payload);
        alert('Test created successfully!');
      }
      navigate('/tests');
    } catch (err) {
      console.error('Error saving test', err);
      alert('Failed to save test.');
    }
  };

  const addSection = () => {
    const newId = Date.now().toString();
    setSections([...sections, { id: newId, name: `Section ${String.fromCharCode(65 + sections.length)}`, questions: [] }]);
    setActiveSectionId(newId);
  };

  const removeSection = (id: string) => {
    if (sections.length === 1) return alert("You must have at least one section.");
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    if (activeSectionId === id) setActiveSectionId(newSections[0].id);
  };

  const updateSectionName = (id: string, name: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, name } : s));
  };

  const addQuestion = (q: any) => {
    setSections(sections.map(s => {
      if (s.id === activeSectionId) {
        if (!s.questions.find(sq => sq.id === q.id)) {
          return { ...s, questions: [...s.questions, q] };
        }
      }
      return s;
    }));
  };

  const removeQuestion = (qId: string) => {
    setSections(sections.map(s => {
      if (s.id === activeSectionId) {
        return { ...s, questions: s.questions.filter(q => q.id !== qId) };
      }
      return s;
    }));
  };

  const handleGlobalMarks = () => {
    const correct = Number((document.getElementById('global-correct-marks') as HTMLInputElement).value);
    const negative = Number((document.getElementById('global-negative-marks') as HTMLInputElement).value);
    
    setSections(sections.map(s => {
      if (s.id === activeSectionId) {
        return {
          ...s,
          questions: s.questions.map(q => ({ ...q, marks: correct, negativeMarks: negative }))
        };
      }
      return s;
    }));
  };

  const autoCalcMarks = () => {
    let total = 0;
    sections.forEach(s => {
      s.questions.forEach(q => {
        total += Number(q.marks || 0);
      });
    });
    setMarks(total);
  };

  const filteredQuestions = Array.isArray(questions) ? questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.topic?.name && q.topic.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const activeSection = sections.find(s => s.id === activeSectionId);
  const activeQuestions = activeSection?.questions || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{testId ? 'Edit Test' : 'Test Builder'}</h1>
            <p className="text-sm text-gray-500">Create sections and select questions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <input 
              type="checkbox" 
              checked={isPublished} 
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" 
            />
            Publish Test
          </label>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
            <Save className="w-5 h-5" />
            Save Test
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Pane: Test Configuration & Selected Questions */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Mock Test - Physics"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input 
                    type="number" 
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
            
            {/* Sections Tab Bar */}
            <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar p-2 gap-2">
              {sections.map(sec => (
                <div 
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors
                    ${activeSectionId === sec.id ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'hover:bg-gray-50 text-gray-600 border border-transparent'}`}
                >
                  <input 
                    type="text" 
                    value={sec.name}
                    onChange={(e) => updateSectionName(sec.id, e.target.value)}
                    className="bg-transparent outline-none w-20 font-medium text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-xs">{sec.questions.length}</span>
                  {sections.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addSection}
                className="flex items-center gap-1 px-3 py-2 text-brand-600 hover:bg-brand-50 rounded-lg text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Questions in {activeSection?.name}</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={autoCalcMarks}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Auto-calc Total
                  </button>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Section Scheme:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">+</span>
                  <input 
                    type="number" 
                    className="w-14 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500" 
                    id="global-correct-marks"
                    defaultValue={4}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">-</span>
                  <input 
                    type="number" 
                    className="w-14 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500" 
                    id="global-negative-marks"
                    defaultValue={1}
                  />
                </div>
                <button 
                  onClick={handleGlobalMarks}
                  className="ml-auto text-xs px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {activeQuestions.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-lg">
                    No questions in this section.<br/>Click + on questions to add them.
                  </div>
                ) : (
                  activeQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 border border-brand-100 bg-brand-50/30 rounded-lg flex gap-3 group items-center">
                      <span className="font-semibold text-gray-500 w-6 text-sm">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.text }}></p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{q.difficulty}</span>
                          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                            <span className="text-xs text-green-600 font-medium">+</span>
                            <input 
                              type="number" 
                              className="w-8 text-xs outline-none bg-transparent"
                              value={q.marks || 0}
                              onChange={(e) => {
                                setSections(sections.map(s => {
                                  if (s.id === activeSectionId) {
                                    const newQs = [...s.questions];
                                    newQs[idx] = { ...newQs[idx], marks: Number(e.target.value) };
                                    return { ...s, questions: newQs };
                                  }
                                  return s;
                                }));
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                            <span className="text-xs text-red-600 font-medium">-</span>
                            <input 
                              type="number" 
                              className="w-8 text-xs outline-none bg-transparent"
                              value={q.negativeMarks || 0}
                              onChange={(e) => {
                                setSections(sections.map(s => {
                                  if (s.id === activeSectionId) {
                                    const newQs = [...s.questions];
                                    newQs[idx] = { ...newQs[idx], negativeMarks: Number(e.target.value) };
                                    return { ...s, questions: newQs };
                                  }
                                  return s;
                                }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              if (idx > 0) {
                                setSections(sections.map(s => {
                                  if (s.id === activeSectionId) {
                                    const newQs = [...s.questions];
                                    [newQs[idx - 1], newQs[idx]] = [newQs[idx], newQs[idx - 1]];
                                    return { ...s, questions: newQs };
                                  }
                                  return s;
                                }));
                              }
                            }}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-gray-400 bg-white rounded shadow-sm border border-gray-100"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => {
                              if (idx < activeQuestions.length - 1) {
                                setSections(sections.map(s => {
                                  if (s.id === activeSectionId) {
                                    const newQs = [...s.questions];
                                    [newQs[idx], newQs[idx + 1]] = [newQs[idx + 1], newQs[idx]];
                                    return { ...s, questions: newQs };
                                  }
                                  return s;
                                }));
                              }
                            }}
                            disabled={idx === activeQuestions.length - 1}
                            className="p-1 text-gray-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-gray-400 bg-white rounded shadow-sm border border-gray-100"
                          >
                            ↓
                          </button>
                        </div>
                        <button 
                          onClick={() => removeQuestion(q.id)}
                          className="p-1 text-red-400 hover:text-red-600 bg-white rounded shadow-sm border border-red-100 w-full flex justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Question Bank */}
        <div className="w-2/3 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Question Bank</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading questions...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No questions found.</div>
            ) : (
              filteredQuestions.map((q) => {
                const isAdded = activeQuestions.some(sq => sq.id === q.id);
                // Also check if added in ANY section to disable?
                // Let's allow same question in different sections, or disable globally. Better to disable globally.
                const isAddedGlobally = sections.some(s => s.questions.some(sq => sq.id === q.id));

                return (
                  <div key={q.id} className={`p-4 border rounded-xl flex gap-4 transition-all ${isAddedGlobally ? 'border-brand-200 bg-brand-50/20' : 'border-gray-100 hover:border-brand-200'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {q.topic?.name && (
                          <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                            {q.topic.name}
                          </span>
                        )}
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          {q.questionType?.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                          ${q.difficulty === 'EASY' ? 'text-green-700 bg-green-50' : 
                            q.difficulty === 'MEDIUM' ? 'text-amber-700 bg-amber-50' : 
                            'text-red-700 bg-red-50'}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="text-gray-900 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.text }}></div>
                    </div>
                    <div className="shrink-0">
                      <button 
                        onClick={() => !isAddedGlobally && addQuestion(q)}
                        disabled={isAddedGlobally}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${isAddedGlobally 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
                      >
                        {isAddedGlobally ? (
                          <>Added</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
