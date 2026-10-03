import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const SuperAdminLayout = () => {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-64 p-6 border-r border-gray-700 flex flex-col">
        <div>
          <h1 className="text-xl font-bold text-brand-500">Super Admin</h1>
          <nav className="mt-8 space-y-4">
            <div className="text-gray-300 cursor-pointer hover:text-white">Overview</div>
            <div className="text-gray-300 cursor-pointer hover:text-white">Organizations</div>
            <div className="text-gray-300 cursor-pointer hover:text-white">Billing & Plans</div>
          </nav>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-700">
          <button 
            onClick={logout}
            className="flex items-center text-gray-400 hover:text-red-400 w-full"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
