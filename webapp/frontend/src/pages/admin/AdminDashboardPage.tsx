'use client';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalVideos: number;
    totalCompletedLessons: number;
    totalAssignments: number;
    totalAssignmentSubmissions: number;
  };
  recentCourses: any[];
  assignmentStatus: Array<{
    id: number;
    name: string;
    email: string;
    assigned_count: number;
    completed_count: number;
    completion_rate: number;
    status: 'completed' | 'pending';
  }>;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      navigate('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center navy-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen navy-gradient">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400">Manage your learning platform</p>
              </div>
              <Link to="/admin/courses">
                <Button size="lg">Manage Courses</Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value={data?.stats.totalUsers || 0}
                icon={Users}
                gradient="from-blue-500 to-blue-600"
              />
              <StatsCard
                title="Total Courses"
                value={data?.stats.totalCourses || 0}
                icon={BookOpen}
                gradient="from-blue-500 to-blue-700"
              />
              <StatsCard
                title="Total Videos"
                value={data?.stats.totalVideos || 0}
                icon={PlayCircle}
                gradient="from-blue-600 to-blue-800"
              />
              <StatsCard
                title="Completed Lessons"
                value={data?.stats.totalCompletedLessons || 0}
                icon={CheckCircle2}
                gradient="from-blue-400 to-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{data?.stats.totalAssignments || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{data?.stats.totalAssignmentSubmissions || 0}</p>
                </CardContent>
              </Card>
            </div>

            {data?.assignmentStatus && data.assignmentStatus.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Student Assignment Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-navy-700 text-left text-gray-400">
                          <th className="pb-3">Student</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Assigned</th>
                          <th className="pb-3">Completed</th>
                          <th className="pb-3">Completion %</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.assignmentStatus.map((student) => (
                          <tr key={student.id} className="border-b border-navy-700/50">
                            <td className="py-3 text-white">{student.name}</td>
                            <td className="py-3 text-gray-300">{student.email}</td>
                            <td className="py-3 text-gray-300">{student.assigned_count}</td>
                            <td className="py-3 text-gray-300">{student.completed_count}</td>
                            <td className="py-3 text-gray-300">{student.completion_rate}%</td>
                            <td className="py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  student.status === 'completed'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Courses */}
            {data?.recentCourses && data.recentCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-navy-700 text-left text-sm text-gray-400">
                          <th className="pb-3 font-medium">Course Name</th>
                          <th className="pb-3 font-medium">Instructor</th>
                          <th className="pb-3 font-medium">Lectures</th>
                          <th className="pb-3 font-medium">Enrollments</th>
                          <th className="pb-3 font-medium">Created</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {data.recentCourses.map((course) => (
                          <tr key={course.id} className="border-b border-navy-700/50 hover:bg-navy-800/30 transition-colors">
                            <td className="py-4 font-medium text-white">
                              {course.title}
                            </td>
                            <td className="py-4 text-gray-400">
                              {course.instructor_name}
                            </td>
                            <td className="py-4 text-gray-400">
                              {course.lecture_count}
                            </td>
                            <td className="py-4 text-gray-400">
                              {course.enrollment_count}
                            </td>
                            <td className="py-4 text-gray-400">
                              {new Date(course.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <Link to="/admin/courses">
                                <Button variant="outline" size="sm">
                                  Manage
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
