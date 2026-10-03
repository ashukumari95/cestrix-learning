import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ClipboardList, TrendingUp, Bell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-slate-500">Here's your learning overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Test Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Tests</h2>
            <Link to="/tests" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">JEE Mains Mock Test 4</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Available starting 10:00 AM Today
                </p>
              </div>
            </div>
            <Link 
              to="/test-portal/123" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Take Test
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Average Score</span>
                <span className="font-medium text-emerald-600">76%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Attendance</span>
                <span className="font-medium text-indigo-600">92%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Announcements */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" /> Recent Announcements
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-900">Holiday Notice</h3>
            <p className="text-sm text-slate-600 mt-1">The coaching center will remain closed on Monday due to a public holiday.</p>
            <p className="text-xs text-slate-400 mt-2">Posted 2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};
