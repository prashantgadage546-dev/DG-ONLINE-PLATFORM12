'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { CourseCard } from '@/components/CourseCard';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

interface DashboardData {
  stats: {
    totalEnrolled: number;
    totalLessons: number;
    completedLessons: number;
    overallProgress: number;
  };
  enrolledCourses: any[];
  recentCourses: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'student') {
      router.push('/admin');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/student');
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
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-400">Continue your learning journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Enrolled Courses"
                value={data?.stats.totalEnrolled || 0}
                icon={BookOpen}
                gradient="from-blue-500 to-blue-600"
              />
              <StatsCard
                title="Total Lessons"
                value={data?.stats.totalLessons || 0}
                icon={Clock}
                gradient="from-cyan-500 to-cyan-600"
              />
              <StatsCard
                title="Completed"
                value={data?.stats.completedLessons || 0}
                icon={Trophy}
                gradient="from-green-500 to-green-600"
              />
              <StatsCard
                title="Overall Progress"
                value={`${data?.stats.overallProgress || 0}%`}
                icon={TrendingUp}
                gradient="from-purple-500 to-purple-600"
              />
            </div>

            {/* Continue Learning */}
            {data?.recentCourses && data.recentCourses.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Continue Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.recentCourses.map((course) => (
                    <CourseCard
                      key={course.course_id}
                      id={course.course_id}
                      title={course.title}
                      description={course.description}
                      thumbnail={course.thumbnail}
                      instructor_name={course.instructor_name}
                      progress={parseFloat(course.progress)}
                      completed_lessons={course.completed_lessons}
                      total_lessons={course.total_lessons}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Enrolled Courses */}
            {data?.enrolledCourses && data.enrolledCourses.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  My Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.enrolledCourses.map((course) => (
                    <CourseCard
                      key={course.course_id}
                      id={course.course_id}
                      title={course.title}
                      description={course.description}
                      thumbnail={course.thumbnail}
                      instructor_name={course.instructor_name}
                      progress={parseFloat(course.progress)}
                      completed_lessons={course.completed_lessons}
                      total_lessons={course.total_lessons}
                    />
                  ))}
                </div>
              </section>
            )}

            {data?.enrolledCourses && data.enrolledCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Start your learning journey by enrolling in courses
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
