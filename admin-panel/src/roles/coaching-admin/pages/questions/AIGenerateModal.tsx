import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';


const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface AIGenerateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [count, setCount] = useState<number>(5);
  const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'SUBJECTIVE'>('MULTIPLE_CHOICE');
  
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API}/questions/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
          questionType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setGeneratedQuestions(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API}/questions/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions: generatedQuestions })
      });

      if (!response.ok) {
        throw new Error('Failed to save generated questions to the bank');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save questions');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate with AI</h2>
              <p className="text-sm text-gray-500">Create high-quality questions instantly using Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {!generatedQuestions ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic / Concept <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Newton's Laws of Motion, Linear Equations, Cell Biology"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                  <select
                    value={questionType}
                    onChange={e => setQuestionType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="SUBJECTIVE">Subjective</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={count}
                    onChange={e => setCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !topic}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-purple-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Questions
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100 flex items-center justify-between">
                <div>Successfully generated {generatedQuestions.length} questions!</div>
                <button
                  onClick={() => setGeneratedQuestions(null)}
                  className="text-green-600 hover:text-green-800 underline text-xs"
                >
                  Generate More
                </button>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-medium text-gray-900">
                        <span className="text-gray-400 mr-2">{idx + 1}.</span>
                        {q.text}
                      </h4>
                      <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 whitespace-nowrap">
                        {q.difficulty}
                      </span>
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-6">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded-lg text-sm border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}>
                            {String.fromCharCode(65 + oIdx)}. {opt.text} {opt.isCorrect && '✓'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveToBank}
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-purple-600/20"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving to Bank...
                    </>
                  ) : (
                    'Approve & Save to Question Bank'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
