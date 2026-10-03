import React from 'react';
import { Outlet } from 'react-router-dom';

export const ParentLayout = () => {
  return (
    <div className="flex h-screen bg-purple-50 text-gray-900">
      <div className="w-64 p-6 border-r border-purple-200 bg-white">
        <h1 className="text-xl font-bold text-purple-600">Parent Portal</h1>
        <nav className="mt-8 space-y-4">
          <div className="text-gray-600 cursor-pointer hover:text-purple-600">Child Progress</div>
          <div className="text-gray-600 cursor-pointer hover:text-purple-600">Fee Receipts</div>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
