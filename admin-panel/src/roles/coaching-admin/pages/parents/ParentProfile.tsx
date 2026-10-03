import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api';
import { 
  ArrowLeft, Phone, Mail, MapPin, ShieldCheck, AlertCircle, 
  MessageSquare, GraduationCap, Clock, Bell, CheckCircle, FileText
} from 'lucide-react';



export const ParentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('STUDENTS');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchParent = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/coaching/users/${id}`);
        if (res.data) {
          const p = res.data;
          setParent({
            name: p.name || 'N/A',
            phone: p.phone || 'N/A',
            email: p.email || 'N/A',
            address: 'N/A',
            relation: 'Guardian',
            initials: p.name ? p.name.substring(0, 2).toUpperCase() : 'PR',
            appStatus: p.isActive ? 'ACTIVE' : 'INACTIVE',
            lastLogin: 'Never',
            students: [],
            notifications: []
          });
        }
      } catch (err) {
        console.error('Error fetching parent profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Optimistic UI update
      const localUrl = URL.createObjectURL(file);
      setProfilePic(localUrl);

      try {
        // 1. Get presigned URL
        const presignRes = await api.post('/upload/presigned-url', {
          filename: file.name,
          contentType: file.type
        });
        
        const { presignedUrl, publicUrl } = presignRes.data;

        // 2. Upload file to R2
        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        // 3. Update user profile in backend (assuming we have a profilePic field or similar)
        // For now we just log it, but in reality we'd do:
        // await api.put(`/users/${id}`, { profileImage: publicUrl });
        console.log('Successfully uploaded profile picture:', publicUrl);

      } catch (err) {
        console.error('Failed to upload image', err);
        alert('Failed to upload image. Please try again.');
        // Revert UI if needed
      }
    }
  };

  const tabs = [
    { id: 'STUDENTS', label: 'Linked Students', icon: GraduationCap },
    { id: 'NOTIFICATIONS', label: 'Communication History', icon: Bell },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'ATTENDANCE': return <CheckCircle size={16} className="text-blue-600" />;
      case 'FEES': return <FileText size={16} className="text-red-600" />;
      case 'TEST': return <FileText size={16} className="text-emerald-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!parent) return <div className="p-10 text-center text-red-500">Parent not found</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Back & Breadcrumb */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 font-semibold hover:text-[#1a5dc9] transition-colors"
      >
        <ArrowLeft size={16} /> Back to Parents
      </button>

      {/* Profile Header */}
      <div className="cx-card bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden border border-gray-200">
        
        {/* Left: Avatar & Basic Info */}
        <div className="flex gap-6 items-center md:items-start w-full md:w-auto">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a5dc9] to-[#001233] text-white flex items-center justify-center text-3xl font-black shadow-lg flex-shrink-0 overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                parent.initials
              )}
            </div>
            {/* Edit overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xs font-bold flex flex-col items-center gap-1">
                <span className="text-lg">📷</span>
                Change Photo
              </span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black" style={{ color: '#0d1b3e' }}>{parent.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-widest">
                {parent.relation}
              </span>
            </div>
            
            <div className="space-y-1.5 mt-3">
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Phone size={14} className="text-gray-400" /> {parent.phone}
              </p>
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Mail size={14} className="text-gray-400" /> {parent.email}
              </p>
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" /> {parent.address}
              </p>
            </div>
          </div>
        </div>

        {/* Right: App Status */}
        <div className="md:ml-auto flex flex-col gap-3 w-full md:w-auto">
          <div className={`p-4 border rounded-xl flex items-start gap-3 w-full md:w-64 ${parent.appStatus === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="mt-0.5">
              {parent.appStatus === 'ACTIVE' ? <ShieldCheck size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-gray-500" />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-0.5">App Access Status</p>
              <p className={`text-base font-black ${parent.appStatus === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-700'}`}>{parent.appStatus}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                <Clock size={10} /> Last Active: {parent.lastLogin}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="cx-btn-primary w-full gap-2 text-xs py-2 bg-[#25d366] hover:bg-[#1ebd59] shadow-md border-none">
              <MessageSquare size={14} /> WhatsApp
            </button>
            <button 
              onClick={() => navigate('edit')} 
              className="cx-btn-secondary w-full gap-2 text-xs py-2"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === t.id 
                ? 'border-[#1a5dc9] text-[#1a5dc9]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="cx-animate-in">
        {activeTab === 'STUDENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parent.students.map((student: any, idx: number) => (
              <div key={idx} className="cx-card bg-white p-5 border border-gray-200 flex items-start gap-4 cursor-pointer hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1a5dc9] flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">Roll: {student.roll}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Class {student.class}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-2">{student.batch}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <div className="cx-card bg-white border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {parent.notifications.map((notif: any) => (
                <div key={notif.id} className={`p-4 flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'ATTENDANCE' ? 'bg-blue-100' :
                    notif.type === 'FEES' ? 'bg-red-100' : 'bg-emerald-100'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{notif.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
