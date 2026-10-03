import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, FileText, Download, Award, TrendingUp } from 'lucide-react';
import api from '../../../../api';

export const ResultsDashboard: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when selecting a new test
  useEffect(() => {
    setSearchQuery('');
  }, [selectedTestId]);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTestId) {
      fetchTestResults(selectedTestId);
    }
  }, [selectedTestId]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coaching/tests');
      setTests(res.data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResults = async (testId: string) => {
    setTestResults(null);
    try {
      const res = await api.get(`/coaching/tests/${testId}/results`);
      setTestResults(res.data);
    } catch (err) {
      console.error('Failed to fetch test results', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Results Dashboard...</div>;
  }

  const handleExportCSV = () => {
    if (!testResults || !testResults.attempts) return;
    const headers = ['Rank', 'Student Name', 'Phone', 'Score', 'Total Marks', 'Accuracy', 'Submitted At'];
    const rows = filteredAttempts.map((attempt: any, index: number) => [
      index + 1,
      attempt.student?.user?.name || 'Unknown',
      attempt.student?.user?.phone || 'No phone',
      Number(attempt.score),
      testResults.totalMarks,
      `${Number(attempt.percentile).toFixed(1)}%`,
      new Date(attempt.endTime).toLocaleString()
    ]);
    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${testResults.testTitle}_Results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttempts = testResults?.attempts?.filter((a: any) => {
    const term = searchQuery.toLowerCase();
    const name = a.student?.user?.name?.toLowerCase() || '';
    const phone = a.student?.user?.phone?.toLowerCase() || '';
    return name.includes(term) || phone.includes(term);
  }) || [];

  if (selectedTestId && testResults) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedTestId(null)} 
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{testResults.testTitle}</h1>
              <p className="text-sm text-gray-500">Total Marks: {testResults.totalMarks} • {testResults.attempts.length} Submissions</p>
            </div>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 font-medium rounded-lg hover:bg-brand-100"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{testResults.attempts.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Award className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {testResults.attempts.length > 0 ? Math.max(...testResults.attempts.map((a: any) => Number(a.score))) : 0}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {testResults.attempts.length > 0 ? (testResults.attempts.reduce((sum: number, a: any) => sum + Number(a.score), 0) / testResults.attempts.length).toFixed(2) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Rankings & Leaderboard</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Accuracy</th>
                  <th className="px-6 py-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchQuery ? 'No results match your search.' : 'No attempts yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((attempt: any, index: number) => (
                    <tr key={attempt.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-700">#{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {attempt.student?.user?.name || 'Unknown'}
                        <div className="text-xs text-gray-500 font-normal">{attempt.student?.user?.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-brand-700">{Number(attempt.score)}</span>
                        <span className="text-gray-400 text-xs ml-1">/ {testResults.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {Number(attempt.percentile).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(attempt.endTime).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weak Topic Analysis */}
        {testResults.topicAnalysis && testResults.topicAnalysis.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Weak Topic Analysis</h2>
              <p className="text-sm text-gray-500">Topics where students struggled the most across all attempts</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {testResults.topicAnalysis.slice(0, 5).map((topic: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1 text-sm font-medium">
                      <span className="text-gray-700">{topic.name}</span>
                      <span className={topic.accuracy < 40 ? 'text-red-600' : topic.accuracy < 70 ? 'text-amber-600' : 'text-green-600'}>
                        {topic.accuracy.toFixed(1)}% Accuracy
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${topic.accuracy < 40 ? 'bg-red-500' : topic.accuracy < 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, topic.accuracy))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Results & Analytics</h1>
        <p className="text-gray-500 text-sm">Select a test to view student performance and rankings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Tests Found</h3>
            <p className="text-gray-500 text-sm">There are no tests available. Go to the Tests section to create one.</p>
          </div>
        ) : (
          tests.map((test) => (
            <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                {test.isPublished ? (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Live</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Draft</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{test.title}</h3>
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span>{test.totalMarks} Marks</span>
                <span>{test.durationMins} Mins</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="font-bold text-gray-900">{test._count?.attempts || 0}</span>
                  <span className="text-gray-500 ml-1">Submissions</span>
                </div>
                <button 
                  onClick={() => setSelectedTestId(test.id)}
                  className="px-4 py-2 text-sm bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
                >
                  View Results
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
