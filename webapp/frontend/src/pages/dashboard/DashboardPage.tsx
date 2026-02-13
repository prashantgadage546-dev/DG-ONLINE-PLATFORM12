'use client';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, Sparkles, Target } from 'lucide-react';
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
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
  };
  enrolledCourses: any[];
  recentCourses: any[];
  pendingAssignmentsList: Array<{
    id: number;
    title: string;
    due_date?: string | null;
    topic_name: string;
    course_title: string;
  }>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'student') {
      navigate('/admin');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, coursesRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get('/courses'),
      ]);

      if (dashboardRes.data.success) {
        const payload = dashboardRes.data.data;
        setData(payload);

        const enrolledIds = new Set(
          (payload.enrolledCourses || []).map((course: any) => Number(course.course_id))
        );

        const allCourses = coursesRes.data?.data || [];
        const suggested = allCourses
          .filter((course: any) => !enrolledIds.has(Number(course.id)))
          .slice(0, 3);
        setRecommended(suggested);
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-400">Continue your learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-effect rounded-2xl p-6 border border-navy-700">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <p className="text-white font-semibold">Learning Streak</p>
                </div>
                <p className="text-3xl font-bold text-white">
                  {Math.max(1, Math.min(30, Math.round((Number(data?.stats.completedLessons || 0) / 2) + 1)))} days
                </p>
                <p className="text-sm text-gray-400 mt-2">Keep your momentum with at least one lesson daily.</p>
              </div>
              <div className="glass-effect rounded-2xl p-6 border border-navy-700">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-blue-400" />
                  <p className="text-white font-semibold">Weekly Goal</p>
                </div>
                <p className="text-3xl font-bold text-white">{Math.round(Number(data?.stats.overallProgress || 0))}%</p>
                <p className="text-sm text-gray-400 mt-2">Target this week: reach 80% total progress.</p>
              </div>
            </div>

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
                gradient="from-blue-500 to-blue-700"
              />
              <StatsCard
                title="Completed"
                value={data?.stats.completedLessons || 0}
                icon={Trophy}
                gradient="from-blue-600 to-blue-800"
              />
              <StatsCard
                title="Overall Progress"
                value={`${data?.stats.overallProgress || 0}%`}
                icon={TrendingUp}
                gradient="from-blue-400 to-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect rounded-2xl p-5 border border-navy-700">
                <p className="text-sm text-gray-400 mb-2">Total Assignments</p>
                <p className="text-3xl font-bold text-white">{data?.stats.totalAssignments || 0}</p>
              </div>
              <div className="glass-effect rounded-2xl p-5 border border-navy-700">
                <p className="text-sm text-gray-400 mb-2">Completed Assignments</p>
                <p className="text-3xl font-bold text-white">{data?.stats.completedAssignments || 0}</p>
              </div>
              <div className="glass-effect rounded-2xl p-5 border border-navy-700">
                <p className="text-sm text-gray-400 mb-2">Pending Assignments</p>
                <p className="text-3xl font-bold text-white">{data?.stats.pendingAssignments || 0}</p>
              </div>
            </div>

            {data?.pendingAssignmentsList && data.pendingAssignmentsList.length > 0 && (
              <div className="glass-effect rounded-2xl p-6 border border-navy-700 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Pending Assignments</h3>
                <div className="space-y-3">
                  {data.pendingAssignmentsList.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/70">
                      <div>
                        <p className="text-white font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-400">
                          {assignment.course_title} • {assignment.topic_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Due</p>
                        <p className="text-sm text-white">
                          {assignment.due_date
                            ? new Date(assignment.due_date).toLocaleDateString()
                            : 'No deadline'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data?.recentCourses && data.recentCourses.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Continue Learning</h2>
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

            {data?.enrolledCourses && data.enrolledCourses.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">My Courses</h2>
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
                  <h3 className="text-xl font-semibold text-white mb-2">No courses enrolled yet</h3>
                  <p className="text-gray-400 mb-4">Start your learning journey by enrolling in courses</p>
                  <Link to="/courses" className="text-blue-400 hover:text-blue-300 font-medium">
                    Browse courses
                  </Link>
                </div>
              </div>
            )}

            {recommended.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white">Recommended For You</h2>
                  <Link to="/courses" className="text-blue-400 hover:text-blue-300 text-sm">View all</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommended.map((course: any) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      thumbnail={course.thumbnail}
                      instructor_name={course.instructor_name}
                      lecture_count={course.lecture_count}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
