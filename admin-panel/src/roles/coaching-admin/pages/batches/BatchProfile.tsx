import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, Users, BookOpen, Target, UserPlus, FileText, CheckCircle, XCircle 
} from 'lucide-react';
import { type Batch } from './BatchList';
import api from '../../../../api';

export const BatchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('STUDENTS');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBatch = async () => {
      try {
        const { data } = await api.get(`/coaching/academic/batches/${id}`);
        setBatch({
          id: data.id,
          name: data.name,
          className: data.classLevel?.name || 'Class',
          targetExam: data.classLevel?.board?.name || 'Exam',
          faculty: 'Assigned Teacher',
          timing: '10:00 AM - 12:00 PM',
          room: 'Room A',
          capacity: data.capacity || 50,
          enrolled: data.enrollments?.length || 0,
          status: 'ACTIVE',
          type: 'OFFLINE'
        });
      } catch (error) {
        console.error("Failed to fetch batch", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBatch();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Batch Not Found</h2>
        <button onClick={() => navigate('/batches')} className="cx-btn-primary">
          Back to Batches
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'STUDENTS', label: 'Students List', icon: Users },
    { id: 'ATTENDANCE', label: 'Mark Attendance', icon: CheckCircle },
    { id: 'TIMETABLE', label: 'Timetable', icon: Clock },
    { id: 'FEES', label: 'Batch Fees', icon: FileText },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* ── Header ── */}
      <div className="cx-card p-6 cx-animate-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none" 
          style={{ background: 'linear-gradient(135deg, #cc2529, transparent)' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <button 
            onClick={() => navigate('/batches')}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-5 flex-1">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm bg-gradient-to-br from-[#001233] to-[#1a5dc9]">
              <Target size={32} className="opacity-80" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#0d1b3e]">{batch.name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  {batch.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {batch.type}
                </span>
              </div>
              <p className="text-sm font-semibold mt-1 text-gray-600">
                {batch.className} • Target: <span style={{ color: '#cc2529' }}>{batch.targetExam}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#f5a623]" /> Faculty: {batch.faculty}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {batch.timing}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {batch.room}</span>
                <span className="flex items-center gap-1.5"><Users size={14} /> {batch.enrolled}/{batch.capacity} Students</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="edit" className="cx-btn-secondary text-xs">Edit Batch</Link>
            <button className="cx-btn-primary text-xs" style={{ background: '#cc2529' }}>
              <UserPlus size={14} className="mr-2" /> Add Student
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-gray-200 px-2 overflow-x-auto cx-animate-in-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'text-[#001233] border-[#001233]' 
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="cx-animate-in-3">
        
        {activeTab === 'STUDENTS' && (
          <div className="cx-card bg-white border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#0d1b3e]">Enrolled Students ({batch.enrolled})</h3>
              <input type="text" placeholder="Search student..." className="cx-input text-xs w-64 bg-white" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Roll No</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Attendance %</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* No students for now */}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ATTENDANCE' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="cx-card p-5">
                <h3 className="font-bold text-[#0d1b3e] mb-3 text-sm">Select Date</h3>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="cx-input w-full" 
                />
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Today's Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Present</span>
                      <span className="font-bold text-emerald-600">4</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Absent</span>
                      <span className="font-bold text-[#cc2529]">1</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Unmarked</span>
                      <span className="font-bold text-gray-400">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 cx-card bg-white border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-[#0d1b3e]">Mark Attendance - {new Date(attendanceDate).toLocaleDateString()}</h3>
                <button className="cx-btn-primary text-xs px-4" style={{ background: '#001233' }}>Save Records</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Roll No</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* No students for now */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TIMETABLE' && (
          <div className="cx-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Weekly Timetable</h3>
            <p className="text-sm text-gray-500 max-w-md">The timetable module is currently being set up by the academic head. Check back later.</p>
          </div>
        )}

        {activeTab === 'FEES' && (
          <div className="cx-card bg-white border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#0d1b3e]">Fee Status - Current Month</h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">Collected: ₹1,45,000</span>
                <span className="text-xs font-bold text-[#cc2529] bg-red-50 px-3 py-1.5 rounded-md">Pending: ₹25,000</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Roll No</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Total Fee</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* No students for now */}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
