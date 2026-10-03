import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import { Settings, Shield, Palette, Building, Users, Plus, Save } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';

export const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState<'organization' | 'branding' | 'roles'>('organization');
  const [loading, setLoading] = useState(true);

  // Org State
  const [orgData, setOrgData] = useState({ name: '', contactEmail: '', contactPhone: '' });
  const [features, setFeatures] = useState({ enableBiometric: false, enableAI: true });
  const [branding, setBranding] = useState({ primaryColor: '#1a5dc9', logoUrl: '' });
  
  // Roles State
  const [roles, setRoles] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  
  const { orgName } = useOrganization();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [orgRes, rolesRes] = await Promise.all([
        api.get('/coaching/settings/organization'),
        api.get('/coaching/settings/roles')
      ]);

      const org = orgRes.data;
      setOrgData({
        name: org.name || '',
        contactEmail: org.contactEmail || '',
        contactPhone: org.contactPhone || '',
      });

      if (org.settings) {
        setFeatures(org.settings.features || { enableBiometric: false, enableAI: true });
        setBranding(org.settings.branding || { primaryColor: '#1a5dc9', logoUrl: '' });
      }

      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/coaching/settings/organization', {
        ...orgData,
        branding,
        features
      });
      alert('Organization settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      await api.post('/coaching/settings/roles', { name: newRoleName });
      setNewRoleName('');
      const rolesRes = await api.get('/coaching/settings/roles');
      setRoles(rolesRes.data);
    } catch (err) {
      alert('Failed to create role');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Settings...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-500">Manage your coaching institute's profile, branding, and access controls.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex min-h-[600px]">
        {/* Sidebar Nav */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('organization')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'organization' ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-5 h-5" />
            General Details
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'branding' ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Palette className="w-5 h-5" />
            Branding & UI
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'roles' ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            Roles & Permissions
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          
          {activeTab === 'organization' && (
            <div className="space-y-6 cx-animate-in">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">General Details</h2>
              <form onSubmit={handleSaveOrganization} className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={orgData.contactEmail}
                      onChange={(e) => setOrgData({...orgData, contactEmail: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={orgData.contactPhone}
                      onChange={(e) => setOrgData({...orgData, contactPhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Feature Toggles</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={features.enableBiometric}
                        onChange={(e) => setFeatures({...features, enableBiometric: e.target.checked})}
                        className="w-4 h-4 text-brand-600 rounded" 
                      />
                      <span className="text-sm text-gray-700">Enable Biometric & RFID Attendance Integration</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={features.enableAI}
                        onChange={(e) => setFeatures({...features, enableAI: e.target.checked})}
                        className="w-4 h-4 text-brand-600 rounded" 
                      />
                      <span className="text-sm text-gray-700">Enable AI Features (Tutor, Summaries, Auto-Grading)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 cx-animate-in">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Branding & UI</h2>
              <form onSubmit={handleSaveOrganization} className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Hex)</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={branding.primaryColor || '#1a5dc9'}
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="w-12 h-12 p-1 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor || '#1a5dc9'}
                      onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                  <input
                    type="url"
                    value={branding.logoUrl || ''}
                    onChange={(e) => setBranding({...branding, logoUrl: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                  {branding.logoUrl && (
                    <div className="mt-3 p-4 bg-gray-50 border rounded flex items-center justify-center">
                      <img src={branding.logoUrl} alt="Logo Preview" className="max-h-20" />
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700">
                    <Save className="w-4 h-4" /> Save Branding
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 cx-animate-in">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Create Custom Role</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Content Creator, Assistant Manager"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button 
                  onClick={handleCreateRole}
                  disabled={!newRoleName}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Role
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{role.name}</h3>
                        {role.isSystem && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">System Role</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" /> {role._count?.users || 0} Users
                      </div>
                    </div>
                    <div className="p-4">
                      {role.permissions?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((rp: any) => (
                            <span key={rp.permissionId} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 font-medium">
                              {rp.permission.resource}:{rp.permission.action}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No specific permissions assigned. (Or inherits default module access)</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
