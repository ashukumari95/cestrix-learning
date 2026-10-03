import React from 'react';
import { Outlet } from 'react-router-dom';

export const TeacherLayout = () => {
  return (
    <div className="flex h-screen bg-white text-gray-900">
      <div className="w-64 p-6 border-r border-gray-200 bg-gray-50">
        <h1 className="text-xl font-bold text-blue-600">Teacher Portal</h1>
        <nav className="mt-8 space-y-4">
          <div className="text-gray-600 cursor-pointer hover:text-blue-600">My Classes</div>
          <div className="text-gray-600 cursor-pointer hover:text-blue-600">Assignments</div>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
