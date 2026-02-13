import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import CoursesPage from '@/pages/courses/CoursesPage';
import CourseDetailsPage from '@/pages/courses/CourseDetailsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
