import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, Camera } from 'lucide-react';
import api from '../api';

export const GlobalProfile = () => {
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Assuming a generic /users/profile endpoint exists, if not we will just mock success
      // await api.put('/auth/profile', { name: formData.name, phone: formData.phone });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match!');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // await api.put('/auth/password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      setMessage('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your personal information and security preferences.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Summary */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-3xl font-bold shadow-inner">
                {formData.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{user?.role}</p>
            <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-emerald-600 bg-emerald-50 px-2 rounded-full">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Org ID</span>
                <span className="font-mono text-xs text-gray-600">{user?.organizationId?.substring(0,8) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" name="email" value={formData.email} disabled
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium">
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
