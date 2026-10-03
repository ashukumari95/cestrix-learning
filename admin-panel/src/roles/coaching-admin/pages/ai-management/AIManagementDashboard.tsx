import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, BrainCircuit, Activity, BarChart3, 
  MessageSquareText, Settings, RefreshCw, Zap, Save, Trash2
} from 'lucide-react';
import api from '../../../../api';

export function AIManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'generator' | 'doubts'>('overview');
  
  // States for generator
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  // States for Overview
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await api.get('/coaching/ai/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch AI stats', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      // In a real scenario we'd call an endpoint like /api/v1/coaching/ai/generate
      // For now we simulate an API call or make a real one if it exists
      const response = await api.post('/coaching/questions/generate-ai', {
        topic, difficulty, count
      });
      if (Array.isArray(response.data)) {
        setGeneratedQuestions(response.data);
      } else if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate questions. Check if API is implemented.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-600" />
            AI Management
          </h1>
          <p className="text-slate-500">Monitor and manage AI capabilities across the platform</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
            activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
            activeTab === 'generator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Generator
        </button>
        <button
          onClick={() => setActiveTab('doubts')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${
            activeTab === 'doubts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <MessageSquareText className="w-4 h-4" /> AI Doubts
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoadingStats ? (
             <div className="flex justify-center p-12">
               <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-700">Total Tokens</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.totalTokens?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Total API Usage</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-700">Questions Gen.</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.breakdown?.find((b: any) => b.operationType === 'QUESTION_GEN')?.requests || 0}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Requests
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <MessageSquareText className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-700">Doubts Solved</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats?.breakdown?.find((b: any) => b.operationType === 'DOUBT_SOLVE')?.requests || 0}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Requests
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-700">Est. Cost</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    ${((stats?.totalTokens || 0) * 0.0001).toFixed(4)}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Based on tokens used</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Recent AI Usage Logs</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Operation</th>
                      <th className="px-6 py-3">Tokens Used</th>
                      <th className="px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentLogs?.length > 0 ? (
                      stats.recentLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">{log.userName}</td>
                          <td className="px-6 py-4">{log.userRole}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{log.operationType}</span>
                          </td>
                          <td className="px-6 py-4 text-emerald-600 font-medium">{log.tokensUsed}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No AI usage logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Generate Questions</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Thermodynamics, Calculus" 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Count</label>
                <input 
                  type="number" 
                  min="1" max="20"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b pb-2 shrink-0">
              <h3 className="font-semibold text-slate-900">Results</h3>
              {generatedQuestions.length > 0 && (
                <button 
                  onClick={async () => {
                    try {
                      setIsGenerating(true);
                      await api.post('/coaching/questions/bulk', { questions: generatedQuestions });
                      alert('Questions saved to bank successfully!');
                      setGeneratedQuestions([]);
                    } catch (err) {
                      console.error('Error saving questions', err);
                      alert('Failed to save questions.');
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save to Question Bank
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto space-y-4">
              {generatedQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Bot className="w-12 h-12 mb-2 opacity-50" />
                  <p>Generated questions will appear here</p>
                </div>
              ) : (
                generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-slate-800">{idx + 1}. {q.text}</p>
                      <button 
                        onClick={() => setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {q.options?.map((opt: any, i: number) => (
                        <div key={i} className={`text-sm px-3 py-1.5 rounded ${opt.isCorrect ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-white border border-slate-200 text-slate-600'}`}>
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'doubts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Recent AI Doubts Resolved</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Question/Doubt</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">Rahul Sharma</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">How do I integrate e^x sin(x)?</td>
                <td className="px-6 py-4">Maths</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Resolved</span></td>
                <td className="px-6 py-4 text-slate-500">2 mins ago</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">Priya Patel</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">What is the difference between SN1 and SN2?</td>
                <td className="px-6 py-4">Chemistry</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Resolved</span></td>
                <td className="px-6 py-4 text-slate-500">15 mins ago</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4">Amit Kumar</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">Can you explain Lenz's Law with an example?</td>
                <td className="px-6 py-4">Physics</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Resolved</span></td>
                <td className="px-6 py-4 text-slate-500">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Quick hack for the extra icon since it wasn't imported initially if needed
const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);
