import React, { useState } from 'react';
import { ChevronLeft, Check, User, Camera, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AddParent = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [data, setData] = useState({
    fullName: 'Rakesh Sharma',
    relation: 'Father',
    mobile: '9876543101',
    email: 'rakesh.s@mail.com',
    address: 'Boring Road, Patna, Bihar'
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate('..'), 1500);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
            <Check size={28} style={{ color: '#059669' }} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black" style={{ color: '#0d1b3e' }}>Profile Updated!</h2>
          <p className="text-sm text-gray-400">Parent details have been saved successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="cx-animate-in flex items-center gap-4">
        <Link to=".." className="p-2 rounded-xl border transition-all hover:border-blue-300" style={{ borderColor: '#dce8f7' }}>
          <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>Edit Parent Profile</h1>
          <p className="text-xs text-gray-400">Update contact and personal information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cx-card bg-white p-6 md:p-8 space-y-8">
        
        {/* Photo Upload Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a5dc9] to-[#001233] text-white flex items-center justify-center text-3xl font-black shadow-lg flex-shrink-0 overflow-hidden">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="opacity-50" />
              )}
            </div>
            <label htmlFor="edit-photo-upload" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg transition-transform hover:scale-110" style={{ background: '#1a5dc9' }}>
              <Camera size={14} />
            </label>
            <input id="edit-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Profile Photo</h3>
            <p className="text-xs text-gray-500 mt-1">Recommended size: 400x400px.<br/>Max file size: 2MB.</p>
            {preview && (
              <button type="button" onClick={() => setPreview(null)} className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1 hover:underline">
                <X size={12} /> Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Full Name</label>
            <input type="text" className="cx-input w-full text-sm" value={data.fullName} onChange={e => setData({...data, fullName: e.target.value})} required />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Relation</label>
            <select className="cx-input w-full text-sm cursor-pointer" value={data.relation} onChange={e => setData({...data, relation: e.target.value})} required>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Mobile Number</label>
            <input type="tel" className="cx-input w-full text-sm" value={data.mobile} onChange={e => setData({...data, mobile: e.target.value})} maxLength={10} required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600">Email Address</label>
            <input type="email" className="cx-input w-full text-sm" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-600">Residential Address</label>
            <input type="text" className="cx-input w-full text-sm" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => navigate('..')} className="cx-btn-secondary px-6">Cancel</button>
          <button type="submit" className="cx-btn-primary px-8">Save Changes</button>
        </div>
      </form>
    </div>
  );
};
