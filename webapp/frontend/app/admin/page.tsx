'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import Link from 'next/link';

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalStudents: number;
    revenue: string;
  };
  recentCourses: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [router]);

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
              <Link href="/admin/courses">
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
                gradient="from-cyan-500 to-cyan-600"
              />
              <StatsCard
                title="Enrollments"
                value={data?.stats.totalEnrollments || 0}
                icon={TrendingUp}
                gradient="from-green-500 to-green-600"
              />
              <StatsCard
                title="Revenue"
                value={`$${data?.stats.revenue || 0}`}
                icon={DollarSign}
                gradient="from-purple-500 to-purple-600"
              />
            </div>

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
                              <Link href={`/admin/courses/${course.id}`}>
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
