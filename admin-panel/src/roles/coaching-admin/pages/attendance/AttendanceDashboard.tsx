import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import { Calendar, CheckCircle, XCircle, Clock, Save, Users } from 'lucide-react';

export const AttendanceDashboard = () => {
  const [stats, setStats] = useState({ totalMarked: 0, present: 0, absent: 0, late: 0, leave: 0 });
  const [batches, setBatches] = useState<any[]>([]);
  
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBatches();
  }, [selectedDate]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/coaching/attendance/stats?date=${selectedDate}`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchBatches = async () => {
    try {
      // Reusing actual batches endpoint 
      const res = await api.get('/coaching/academic/batches');
      setBatches(res.data.data);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    }
  };

  const fetchBatchAttendance = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/coaching/attendance/batch/${selectedBatchId}?date=${selectedDate}`);
      setAttendanceRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchAttendance();
    }
  }, [selectedBatchId, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => prev.map(record => 
      record.studentId === studentId ? { ...record, status } : record
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedBatchId) return;
    setSaving(true);
    try {
      const recordsToSave = attendanceRecords.map(r => ({
        studentId: r.studentId,
        status: r.status || 'PRESENT', // default to present if null
        remarks: r.remarks
      }));

      await api.post(`/coaching/attendance/batch/${selectedBatchId}`, {
        date: selectedDate,
        records: recordsToSave
      });
      alert('Attendance saved successfully');
      fetchStats();
    } catch (err) {
      console.error('Failed to save attendance', err);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500">Track and manage student attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Marked', value: stats.totalMarked, icon: Users, color: 'blue' },
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'emerald' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'red' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'amber' },
          { label: 'On Leave', value: stats.leave, icon: Calendar, color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">Take Attendance</h2>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm min-w-[200px]"
            >
              <option value="">Select a Batch</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          {selectedBatchId && attendanceRecords.length > 0 && (
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>

        {!selectedBatchId ? (
          <div className="p-12 text-center text-gray-500">
            Select a batch from the dropdown above to view and mark attendance.
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-gray-500">Loading student list...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students found in this batch.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 w-1/4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceRecords.map(record => (
                  <tr key={record.studentId} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{record.name}</div>
                      <div className="text-xs text-gray-500">{record.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => {
                          const isActive = record.status === status || (!record.status && status === 'PRESENT');
                          const colors: any = {
                            PRESENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                            ABSENT: 'bg-red-100 text-red-800 border-red-200',
                            LATE: 'bg-amber-100 text-amber-800 border-amber-200',
                            LEAVE: 'bg-purple-100 text-purple-800 border-purple-200'
                          };
                          const defaultColors = 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50';
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(record.studentId, status)}
                              className={`px-3 py-1 border rounded-full text-xs font-medium transition-colors ${isActive ? colors[status] : defaultColors}`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={record.remarks || ''}
                        onChange={(e) => {
                          setAttendanceRecords(prev => prev.map(r => 
                            r.studentId === record.studentId ? { ...r, remarks: e.target.value } : r
                          ));
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
