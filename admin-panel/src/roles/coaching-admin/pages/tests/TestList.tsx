import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react';
import api from '../../../../api';
import { useAuth } from '../../../../context/AuthContext';
import { AssignTestModal } from './AssignTestModal';

interface Test {
  id: string;
  title: string;
  durationMins: number;
  totalMarks: number;
  isPublished: boolean;
  createdAt: string;
  _count: {
    questions: number;
    attempts: number;
  };
}

export const TestList = () => {
  const { token } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalData, setAssignModalData] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    fetchTests();
  }, [token]);

  const fetchTests = async () => {
    try {
      const res = await api.get('/coaching/tests');
      setTests(res.data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.delete(`/coaching/tests/${id}`);
      fetchTests();
    } catch (err) {
      alert('Error deleting test');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test & Exam System</h1>
          <p className="text-gray-500">Manage mock tests, topic tests, and full syllabus exams.</p>
        </div>
        <Link
          to="/tests/build"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          <Plus className="w-5 h-5" />
          Create New Test
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-gray-600">Test Title</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Duration</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Marks</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Questions</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading tests...</td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No tests created yet.</td></tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{test.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {test.durationMins} mins
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{test.totalMarks}</td>
                    <td className="px-6 py-4 text-gray-600">{test._count.questions}</td>
                    <td className="px-6 py-4">
                      {test.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Assign to Batches"
                          onClick={() => setAssignModalData({ id: test.id, title: test.title })}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                        <Link
                          to={`/tests/build?id=${test.id}`}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Test"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteTest(test.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignModalData && (
        <AssignTestModal 
          testId={assignModalData.id}
          testTitle={assignModalData.title}
          onClose={() => setAssignModalData(null)}
          onSuccess={() => {
            setAssignModalData(null);
            alert('Test successfully assigned!');
          }}
        />
      )}
    </div>
  );
};
