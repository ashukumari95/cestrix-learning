import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Award, BookOpen,
  Calendar, BarChart2, Shield, Settings, Users, Star,
  CheckCircle, FileText, Camera, AlertTriangle
} from 'lucide-react';
import api from '../../../../api';

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  subject: string;
  experience: number;
  type: 'FULL_TIME' | 'PART_TIME' | 'GUEST';
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  rating: number;
  batchesAssigned: number;
  joinDate: string;
}

export const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const { data } = await api.get(`/coaching/users/${id}`);
        // Transform backend user to Teacher format for UI
        setTeacher({
          id: data.id,
          empId: data.teacherProfile?.employeeId || data.id.slice(0, 8).toUpperCase(),
          name: data.name,
          phone: data.phone || 'N/A',
          email: data.email || 'N/A',
          initials: data.name ? data.name.substring(0, 2).toUpperCase() : '??',
          subject: data.teacherProfile?.specialization || 'General',
          experience: 5,
          type: 'FULL_TIME',
          status: data.isActive ? 'ACTIVE' : 'INACTIVE',
          rating: 4.8,
          batchesAssigned: data.teacherProfile?.batches?.length || 0,
          joinDate: new Date(data.createdAt).toLocaleDateString('en-IN')
        });
      } catch (err) {
        console.error('Failed to fetch teacher', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTeacher();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const localUrl = URL.createObjectURL(file);
      setProfilePic(localUrl);

      try {
        const presignRes = await api.post('/upload/presigned-url', {
          filename: file.name,
          contentType: file.type
        });
        
        const { presignedUrl, publicUrl } = presignRes.data;

        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        console.log('Successfully uploaded profile picture:', publicUrl);
      } catch (err) {
        console.error('Failed to upload image', err);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading teacher...</div>;

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Teacher Not Found</h2>
        <button onClick={() => navigate('/teachers')} className="cx-btn-primary">
          Back to Teachers
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: BarChart2 },
    { id: 'TIMETABLE', label: 'Timetable', icon: Calendar },
    { id: 'PERFORMANCE', label: 'Performance', icon: Star },
    { id: 'PERMISSIONS', label: 'Access & Permissions', icon: Shield },
  ];

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    ON_LEAVE: 'bg-amber-50 text-amber-700 border-amber-200',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const SUBJECT_COLOR: Record<string, string> = {
    Physics:   '#1a5dc9',
    Maths:     '#cc2529',
    Chemistry: '#f5a623',
    Biology:   '#059669',
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      
      {/* ── Header ── */}
      <div className="cx-card p-6 cx-animate-in relative overflow-hidden">
        {/* Background Decorative Graphic */}
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none" 
          style={{ background: `linear-gradient(135deg, ${SUBJECT_COLOR[teacher.subject] || '#1a5dc9'}, transparent)` }} />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <button 
            onClick={() => navigate('/teachers')}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-5 flex-1">
            {/* Avatar */}
            <div 
              className="relative group w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm overflow-hidden cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${SUBJECT_COLOR[teacher.subject] || '#1a5dc9'}, #000)` }}
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                teacher.initials
              )}
              {/* Hover Overlay */}
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={16} />
                <span className="text-[10px] mt-1">Upload</span>
              </label>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#0d1b3e]">{teacher.name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[teacher.status]}`}>
                  {teacher.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {teacher.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-semibold mt-1" style={{ color: SUBJECT_COLOR[teacher.subject] || '#1a5dc9' }}>
                {teacher.subject} Expert • {teacher.experience} Years Experience
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Award size={14} style={{ color: '#f5a623' }} /> Rating: {teacher.rating.toFixed(1)}/5.0</span>
                <span className="flex items-center gap-1.5"><Phone size={14} /> {teacher.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={14} /> {teacher.email}</span>
                <span className="flex items-center gap-1.5"><Settings size={14} /> Emp ID: {teacher.empId}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => navigate('edit')} className="cx-btn-secondary text-xs">Edit Profile</button>
            <button className="cx-btn-primary text-xs">Message</button>
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
                ? 'text-[#1a5dc9] border-[#1a5dc9]' 
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="cx-animate-in-3">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Batches', value: teacher.batchesAssigned, icon: Users, color: '#1a5dc9', bg: '#e8f0fb' },
                  { label: 'Classes/Wk', value: teacher.batchesAssigned * 3, icon: Calendar, color: '#059669', bg: '#ecfdf5' },
                  { label: 'Doubts Solved', value: '342', icon: CheckCircle, color: '#9333ea', bg: '#f3e8ff' },
                  { label: 'Materials', value: '45', icon: FileText, color: '#f5a623', bg: '#fffbeb' },
                ].map((k, i) => (
                  <div key={i} className="cx-card p-4 flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                      <k.icon size={16} style={{ color: k.color }} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#0d1b3e]">{k.value}</p>
                      <p className="text-[11px] text-gray-500 font-semibold">{k.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Batches Overview */}
              <div className="cx-card p-6">
                <h3 className="text-sm font-black text-[#0d1b3e] mb-4 flex items-center gap-2">
                  <BookOpen size={16} /> Assigned Batches
                </h3>
                {teacher.batchesAssigned > 0 ? (
                  <div className="space-y-3">
                    {[...Array(teacher.batchesAssigned)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Target JEE {2025 + i} (Batch {String.fromCharCode(65+i)})</p>
                          <p className="text-xs text-gray-500 mt-0.5">{teacher.subject} • 45 Students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-[#1a5dc9]">Mon, Wed, Fri</p>
                          <p className="text-[10px] text-gray-400">10:00 AM - 11:30 AM</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">No batches assigned yet.</p>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="cx-card p-6 bg-gradient-to-br from-[#001233] to-[#001845] text-white">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Star size={16} className="text-[#f5a623]" /> Student Feedback
                </h3>
                <div className="text-4xl font-black mb-1">{teacher.rating.toFixed(1)}<span className="text-xl text-gray-400 font-medium">/5</span></div>
                <p className="text-xs text-blue-200 mb-4">Based on 124 reviews</p>
                <div className="space-y-2">
                  {['Clarity', 'Punctuality', 'Doubt Solving'].map((metric, i) => (
                    <div key={metric}>
                      <div className="flex justify-between text-[11px] mb-1 text-gray-300">
                        <span>{metric}</span>
                        <span>{4.5 + (i * 0.2)}/5</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0e3578] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f5a623] rounded-full" style={{ width: `${(4.5 + (i * 0.2)) * 20}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TIMETABLE' && (
          <div className="cx-card p-6">
            <h3 className="text-sm font-black text-[#0d1b3e] mb-4 flex items-center gap-2">
              <Calendar size={16} /> Weekly Timetable
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 px-4 text-left font-bold text-gray-500 text-xs w-32">Time</th>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <th key={day} className="py-3 px-4 text-center font-bold text-gray-500 text-xs">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                    <tr key={time} className="hover:bg-gray-50/50">
                      <td className="py-4 px-4 font-semibold text-gray-700 text-xs whitespace-nowrap">{time}</td>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                        const hasClass = (i % 2 === 0 && time === '09:00 AM') || (i % 2 !== 0 && time === '02:00 PM');
                        return (
                          <td key={day} className="py-4 px-4">
                            {hasClass ? (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                                <p className="text-[11px] font-bold text-blue-700 truncate">Target JEE {2025 + (i%2)}</p>
                                <p className="text-[9px] text-blue-500 mt-0.5">{teacher.subject}</p>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'PERFORMANCE' && (
           <div className="cx-card p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
               <BarChart2 size={24} className="text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">Performance Analytics</h3>
             <p className="text-sm text-gray-500">Detailed topic-wise metrics and test outcomes will appear here.</p>
           </div>
        )}

        {activeTab === 'PERMISSIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cx-card p-6">
              <h3 className="text-sm font-black text-[#0d1b3e] mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Shield size={16} /> App Permissions
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Manage Attendance', desc: 'Can mark attendance for assigned batches', checked: true },
                  { label: 'Upload LMS Content', desc: 'Can upload notes, PDFs, and video links', checked: true },
                  { label: 'Create Tests', desc: 'Can create and schedule tests', checked: false },
                  { label: 'View Fee Status', desc: 'Can see student payment records', checked: false },
                  { label: 'Send Announcements', desc: 'Can push notifications to students/parents', checked: true },
                ].map((perm, i) => (
                  <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input type="checkbox" defaultChecked={perm.checked} className="mt-1 w-4 h-4 text-[#1a5dc9] rounded focus:ring-[#1a5dc9]" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{perm.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{perm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                <button className="cx-btn-primary text-xs px-6 py-2">Save Permissions</button>
              </div>
            </div>
            
            <div className="cx-card p-6 bg-[#fffbeb] border border-[#f5a623]/30">
              <h3 className="text-sm font-black text-[#d97706] mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Important Note
              </h3>
              <p className="text-xs text-[#b45309] leading-relaxed">
                Changes to permissions take effect immediately. Be careful when granting "View Fee Status" or "Send Announcements" to guest faculty. 
                Teachers can only access data related to their assigned batches unless global permissions are granted by a Super Admin.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
