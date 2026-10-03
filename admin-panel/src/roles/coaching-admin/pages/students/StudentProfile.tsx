import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, BookOpen, Clock, 
  CreditCard, Award, AlertTriangle, Fingerprint, 
  MessageSquare
} from 'lucide-react';
import api from '../../../../api';

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await api.get(`/coaching/users/${id}`);
        const sp = data.studentProfile;
        const firstGuardian = sp?.guardians?.[0];
        const addr = sp?.address;
        setStudent({
          id: data.id,
          name: data.name,
          avatar: `https://i.pravatar.cc/150?u=${data.id}`,
          rollNo: sp?.rollNo || sp?.enrollmentNo || 'N/A',
          class: sp?.classLevel?.name || 'N/A',
          target: 'N/A',
          status: data.isActive ? 'ACTIVE' : 'INACTIVE',
          phone: data.phone || 'N/A',
          email: data.email || 'N/A',
          address: addr
            ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim().replace(/^,\s*/, '')
            : 'N/A',
          biometricId: 'N/A',
          joinDate: new Date(data.createdAt).toLocaleDateString('en-IN'),
          batch: sp?.batches?.[0]?.batch?.name || 'Unassigned',
          mode: sp?.studentType || 'OFFLINE',
          guardian: {
            name: firstGuardian?.name || 'N/A',
            relation: firstGuardian?.relation || 'Guardian',
            phone: firstGuardian?.phone || 'N/A',
          },
          attendances: sp?.attendances || [],
          fees: sp?.studentFees || [],
        });
      } catch (error) {
        console.error("Failed to fetch student profile", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);


  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!student) return <div className="p-10 text-center text-red-500">Student not found</div>;

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'ACADEMIC', label: 'Academic & Tests' },
    { id: 'ATTENDANCE', label: 'Attendance' },
    { id: 'FEES', label: 'Fees & Payments' },
    { id: 'AI_DOUBTS', label: 'AI Doubts & Weak Topics' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0d1b3e]">{student.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                {student.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Roll No: <span className="text-gray-900">{student.rollNo}</span> • {student.class} • {student.target}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="cx-btn-secondary px-4 bg-white text-xs">
            <Fingerprint size={14} className="mr-2 text-gray-400" /> Map Biometric
          </button>
          <button className="cx-btn-primary px-4 text-xs" style={{ background: '#1a5dc9' }}>
            <MessageSquare size={14} className="mr-2" /> Message Parent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="cx-card bg-white p-5 border border-gray-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#1a5dc9] to-[#0e3578]"></div>
            <img src={student.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto relative z-10 mb-3" />
            <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-xs text-gray-500 font-medium">{student.batch}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-gray-50 text-gray-600">
                {student.mode}
              </span>
            </div>
            
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{student.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{student.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-700">{student.address}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-left">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Guardian Details</p>
              <p className="text-sm font-semibold text-gray-900">{student.guardian.name}</p>
              <p className="text-xs text-gray-500">{student.guardian.relation} • {student.guardian.phone}</p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex overflow-x-auto hide-scrollbar shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-blue-50 text-[#1a5dc9]' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="cx-card bg-white p-6 border border-gray-200 min-h-[400px]">
            
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6 cx-animate-in">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Recent Attendance</p>
                    <p className="text-2xl font-black text-[#1a5dc9]">
                      {student.attendances.length > 0 
                        ? `${Math.round((student.attendances.filter((a: any) => a.status === 'PRESENT').length / student.attendances.length) * 100)}%` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Average Test Score</p>
                    <p className="text-2xl font-black text-emerald-600">N/A</p>
                  </div>
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Fee Dues</p>
                    <p className="text-2xl font-black text-red-600">
                      ₹{student.fees.reduce((acc: number, f: any) => acc + f.installments.filter((i:any) => i.status === 'PENDING').reduce((s:number, i:any) => s + Number(i.amount), 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Recent Activities</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Appeared for Weekly Test (Physics)', date: 'Today, 10:00 AM', icon: Award, color: 'text-purple-500' },
                      { title: 'Biometric Attendance Marked', date: 'Today, 07:55 AM', icon: Fingerprint, color: 'text-emerald-500' },
                      { title: 'Asked 3 Doubts via AI Assistant', date: 'Yesterday', icon: BookOpen, color: 'text-blue-500' }
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`mt-0.5 ${act.color}`}><act.icon size={16} /></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{act.title}</p>
                          <p className="text-xs text-gray-400">{act.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ACADEMIC' && (
              <div className="space-y-6 cx-animate-in">
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Test Performance</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Mock Test 4 (Full Syllabus)', score: '240/300', rank: '12 / 150' },
                    { name: 'Topic Test - Thermodynamics', score: '85/100', rank: '5 / 150' },
                    { name: 'Topic Test - Calculus', score: '60/100', rank: '42 / 150' },
                  ].map((test, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{test.name}</p>
                        <p className="text-xs text-gray-500">Rank: {test.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1a5dc9]">{test.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ATTENDANCE' && (
              <div className="space-y-6 cx-animate-in">
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Recent Attendance</h3>
                {student.attendances.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] text-gray-400">
                    <div className="text-center">
                      <Clock size={40} className="mx-auto mb-3 opacity-20" />
                      <p>No attendance records found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {student.attendances.map((att: any, i: number) => (
                      <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${att.status === 'PRESENT' ? 'bg-green-50 border-green-100' : att.status === 'ABSENT' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{new Date(att.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-gray-500">{att.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${att.status === 'PRESENT' ? 'bg-green-100 text-green-700' : att.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'FEES' && (
              <div className="space-y-6 cx-animate-in">
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Fee Installments & Payments</h3>
                {student.fees.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] text-gray-400">
                    <div className="text-center">
                      <CreditCard size={40} className="mx-auto mb-3 opacity-20" />
                      <p>No fee structures assigned yet.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.fees.map((fee: any, i: number) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900">Total Assigned: ₹{Number(fee.totalAmount).toLocaleString()}</h4>
                          <span className="text-xs text-gray-500">{fee.installments.length} Installments</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {fee.installments.map((inst: any, j: number) => (
                            <div key={j} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div>
                                <p className="text-sm font-medium text-gray-800">Installment {j + 1}</p>
                                <p className="text-xs text-gray-500">Due: {new Date(inst.dueDate).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">₹{Number(inst.amount).toLocaleString()}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inst.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {inst.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'AI_DOUBTS' && (
              <div className="space-y-6 cx-animate-in">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                  <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-900">Weak Topics Identified by AI</h4>
                    <p className="text-xs text-orange-700 mt-1">Based on test performance and AI doubt queries, the student is struggling with:</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-white text-orange-800 text-[10px] font-bold rounded shadow-sm">Rotational Mechanics</span>
                      <span className="px-2 py-1 bg-white text-orange-800 text-[10px] font-bold rounded shadow-sm">Integral Calculus</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
