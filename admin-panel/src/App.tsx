import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Role-based Layouts & Pages
import { SuperAdminLayout } from './roles/super-admin/layouts/SuperAdminLayout';
import { SuperAdminDashboard } from './roles/super-admin/pages/SuperAdminDashboard';

import { CoachingAdminLayout } from './roles/coaching-admin/layouts/CoachingAdminLayout';
import { CoachingAdminDashboard } from './roles/coaching-admin/pages/CoachingAdminDashboard';
import { OrganizationProvider } from './roles/coaching-admin/context/OrganizationContext';
import { StudentList } from './roles/coaching-admin/pages/students/StudentList';
import { AddStudent } from './roles/coaching-admin/pages/students/AddStudent';
import { ImportStudents } from './roles/coaching-admin/pages/students/ImportStudents';
import { StudentProfile } from './roles/coaching-admin/pages/students/StudentProfile';
import { BatchList } from './roles/coaching-admin/pages/batches/BatchList';
import { AddBatch } from './roles/coaching-admin/pages/batches/AddBatch';
import { BatchProfile } from './roles/coaching-admin/pages/batches/BatchProfile';
import { TeacherList } from './roles/coaching-admin/pages/teachers/TeacherList';
import { AddTeacher } from './roles/coaching-admin/pages/teachers/AddTeacher';
import { TeacherProfile } from './roles/coaching-admin/pages/teachers/TeacherProfile';
import { ParentList } from './roles/coaching-admin/pages/parents/ParentList';
import { ParentProfile } from './roles/coaching-admin/pages/parents/ParentProfile';
import { AddParent } from './roles/coaching-admin/pages/parents/AddParent';
import { CoursesPage } from './roles/coaching-admin/pages/courses/CoursesPage';
import { AddCourse } from './roles/coaching-admin/pages/courses/AddCourse';
import { CourseProfile } from './roles/coaching-admin/pages/courses/CourseProfile';
import { QuestionBank } from './roles/coaching-admin/pages/questions/QuestionBank';
import { AddQuestion } from './roles/coaching-admin/pages/questions/AddQuestion';
import { TestList } from './roles/coaching-admin/pages/tests/TestList';
import { TestBuilder } from './roles/coaching-admin/pages/tests/TestBuilder';
import { ResultsDashboard } from './roles/coaching-admin/pages/results/ResultsDashboard';
import { FeesDashboard } from './roles/coaching-admin/pages/fees/FeesDashboard';
import { AttendanceDashboard } from './roles/coaching-admin/pages/attendance/AttendanceDashboard';
import NotificationsDashboard from './roles/coaching-admin/pages/notifications/NotificationsDashboard';
import { AIManagementDashboard } from './roles/coaching-admin/pages/ai-management/AIManagementDashboard';
import { SettingsDashboard } from './roles/coaching-admin/pages/settings';
import { TeacherLayout } from './roles/teacher/layouts/TeacherLayout';
import { TeacherDashboard } from './roles/teacher/pages/TeacherDashboard';

import { ParentLayout } from './roles/parent/layouts/ParentLayout';
import { ParentDashboard } from './roles/parent/pages/ParentDashboard';

import { GlobalProfile } from './pages/GlobalProfile';

import { StudentLayout } from './roles/student/layouts/StudentLayout';
import { StudentDashboard } from './roles/student/pages/StudentDashboard';
import { TestPortal } from './roles/student/pages/cbt/TestPortal';
import { AITutor } from './roles/student/pages/AITutor';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// RBAC Protected Route Wrapper
const ProtectedRoute = ({ allowedRole, children }: { allowedRole: string, children: React.ReactNode }) => {
  const { role } = useAuth();
  if (role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
};

function AppContent() {
  const { role, token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
      <Routes>
        {role === 'SUPER_ADMIN' && (
          <Route path="/" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
          </Route>
        )}

        {role === 'COACHING_ADMIN' && (
          <Route path="/" element={<OrganizationProvider><CoachingAdminLayout /></OrganizationProvider>}>
            <Route index element={<CoachingAdminDashboard />} />

            {/* Students */}
            <Route path="students">
              <Route index element={<StudentList />} />
              <Route path="add" element={<AddStudent />} />
              <Route path="import" element={<ImportStudents />} />
              <Route path=":id" element={<StudentProfile />} />
            </Route>

            {/* Batches */}
            <Route path="batches">
              <Route index element={<BatchList />} />
              <Route path="add" element={<AddBatch />} />
              <Route path=":id" element={<BatchProfile />} />
              <Route path=":id/edit" element={<AddBatch />} />
            </Route>

            {/* Teachers */}
            <Route path="teachers">
              <Route index element={<TeacherList />} />
              <Route path="add" element={<AddTeacher />} />
              <Route path=":id" element={<TeacherProfile />} />
              <Route path=":id/edit" element={<AddTeacher />} />
            </Route>

            {/* Parents */}
            <Route path="parents">
              <Route index element={<ParentList />} />
              <Route path=":id" element={<ParentProfile />} />
              <Route path=":id/edit" element={<AddParent />} />
            </Route>

            {/* Courses */}
            <Route path="courses">
              <Route index element={<CoursesPage />} />
              <Route path="add" element={<AddCourse />} />
              <Route path=":id" element={<CourseProfile />} />
              <Route path=":id/edit" element={<AddCourse />} />
            </Route>

            <Route path="store" element={<Navigate to="/courses#store" replace />} />

            {/* Question Bank */}
            <Route path="questions">
              <Route index element={<QuestionBank />} />
              <Route path="add" element={<AddQuestion />} />
              <Route path=":id/edit" element={<AddQuestion />} />
            </Route>
            
            {/* Tests & Exams */}
            <Route path="tests">
              <Route index element={<TestList />} />
              <Route path="build" element={<TestBuilder />} />
            </Route>

            {/* Results & Analytics */}
            <Route path="results" element={<ResultsDashboard />} />

            {/* Fees & Payments */}
            <Route path="fees" element={<FeesDashboard />} />

            {/* Attendance */}
            <Route path="attendance" element={<AttendanceDashboard />} />

            {/* Notifications */}
            <Route path="notifications" element={<NotificationsDashboard />} />

            {/* AI Management */}
            <Route path="ai-management" element={<AIManagementDashboard />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsDashboard />} />

            {/* Global Profile */}
            <Route path="profile" element={<GlobalProfile />} />

            <Route path="*" element={<div className="p-6 text-center text-gray-500">Page not found</div>} />
          </Route>
        )}

        {role === 'TEACHER' && (
          <Route path="/" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="profile" element={<GlobalProfile />} />
          </Route>
        )}

        {role === 'PARENT' && (
          <Route path="/" element={<ParentLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="profile" element={<GlobalProfile />} />
          </Route>
        )}

        {role === 'STUDENT' && (
          <>
            <Route path="/test-portal/:id" element={<TestPortal />} />
            <Route path="/*" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<GlobalProfile />} />
              <Route path="ai-tutor" element={<AITutor />} />
              {/* <Route path="tests" element={<StudentTestList />} /> */}
              {/* <Route path="results" element={<StudentResults />} /> */}
            </Route>
          </>
        )}
      </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
