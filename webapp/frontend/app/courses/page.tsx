"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CourseCard } from "@/components/CourseCard";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor_name?: string;
  lecture_count?: number;
  progress?: number;
  completed_lessons?: number;
  total_lessons?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");

        // Handle both possible backend formats safely
        const courseData = res.data?.data || res.data || [];

        setCourses(courseData);
        setFilteredCourses(courseData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.title?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">
          Explore Courses
        </h1>

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

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 py-20">
          Loading courses...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No courses found.
        </div>
      )}

      {/* Courses Grid */}
      {!loading && filteredCourses.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              thumbnail={course.thumbnail}
              instructor_name={course.instructor_name}
              lecture_count={course.lecture_count}
              progress={course.progress}
              completed_lessons={course.completed_lessons}
              total_lessons={course.total_lessons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
