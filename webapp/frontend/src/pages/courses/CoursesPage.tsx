'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor_name?: string;
  lecture_count?: number;
  enrollment_count?: number;
  progress?: number;
  completed_lessons?: number;
  total_lessons?: number;
}

type FilterMode = 'all' | 'enrolled' | 'available';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<FilterMode>('all');
  const [enrolledSet, setEnrolledSet] = useState<Set<number>>(new Set());
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [courseRes, dashboardRes] = await Promise.all([
        api.get('/courses'),
        api.get('/dashboard/student').catch(() => null),
      ]);

      const courseData = courseRes.data?.data || courseRes.data || [];
      setCourses(courseData);

      const enrolled = dashboardRes?.data?.data?.enrolledCourses || [];
      setEnrolledSet(new Set(enrolled.map((c: any) => Number(c.course_id))));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title?.toLowerCase().includes(search.toLowerCase());
      const isEnrolled = enrolledSet.has(Number(course.id));
      if (mode === 'enrolled') return matchesSearch && isEnrolled;
      if (mode === 'available') return matchesSearch && !isEnrolled;
      return matchesSearch;
    });
  }, [courses, search, mode, enrolledSet]);

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingId(courseId);
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledSet((prev) => new Set(prev).add(courseId));
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate('/auth/login');
        return;
      }
      console.error('Enroll failed:', error);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Explore Courses</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={mode === 'all' ? 'default' : 'outline'} onClick={() => setMode('all')}>
          All
        </Button>
        <Button variant={mode === 'enrolled' ? 'default' : 'outline'} onClick={() => setMode('enrolled')}>
          Enrolled
        </Button>
        <Button variant={mode === 'available' ? 'default' : 'outline'} onClick={() => setMode('available')}>
          Available
        </Button>
      </div>

      {loading && <div className="text-center text-gray-400 py-20">Loading courses...</div>}

      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-20 text-gray-400">No courses found.</div>
      )}

      {!loading && filteredCourses.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledSet.has(Number(course.id));
            return (
              <div key={course.id} className="space-y-3">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail={course.thumbnail}
                  instructor_name={course.instructor_name}
                  lecture_count={course.lecture_count}
                  progress={isEnrolled ? course.progress : undefined}
                  completed_lessons={isEnrolled ? course.completed_lessons : undefined}
                  total_lessons={isEnrolled ? course.total_lessons : undefined}
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${isEnrolled ? 'bg-blue-600/20 text-blue-300' : 'bg-navy-700 text-gray-300'}`}>
                    {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </span>
                  {!isEnrolled && (
                    <Button size="sm" onClick={() => handleEnroll(course.id)} disabled={enrollingId === course.id}>
                      {enrollingId === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
