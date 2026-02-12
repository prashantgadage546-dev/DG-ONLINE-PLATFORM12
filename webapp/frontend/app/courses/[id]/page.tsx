"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";

interface Lecture {
  id: number;
  title: string;
  video_url: string;
  duration: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  lectures: Lecture[];
}

export default function CourseDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);

        if (res.data.success) {
          setCourse(res.data.data);

          if (res.data.data.lectures?.length > 0) {
            setSelectedLecture(res.data.data.lectures[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Course not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">

      {/* Top Section */}
      <div className="px-8 py-6 border-b border-navy-700">
        <Link
          href="/courses"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-500 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Link>

        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-400 max-w-3xl">{course.description}</p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">

        {/* Video Section */}
        <div className="lg:col-span-2 space-y-4">

          <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {selectedLecture ? (
              <video
                src={selectedLecture.video_url}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <PlayCircle size={64} />
                <p>No lecture selected</p>
              </div>
            )}
          </div>

          {selectedLecture && (
            <div>
              <h2 className="text-xl font-semibold">
                {selectedLecture.title}
              </h2>
              <p className="text-sm text-gray-400">
                Duration: {selectedLecture.duration} seconds
              </p>
            </div>
          )}
        </div>

        {/* Lecture Sidebar */}
        <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
          <h3 className="text-lg font-semibold mb-4">
            Lectures ({course.lectures?.length || 0})
          </h3>

          {course.lectures?.length === 0 && (
            <p className="text-gray-400 text-sm">
              No lectures available.
            </p>
          )}

          <div className="space-y-3">
            {course.lectures?.map((lecture) => (
              <div
                key={lecture.id}
                onClick={() => setSelectedLecture(lecture)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedLecture?.id === lecture.id
                    ? "bg-blue-600"
                    : "bg-navy-700 hover:bg-navy-600"
                }`}
              >
                <p className="text-sm font-medium">
                  {lecture.title}
                </p>
                <p className="text-xs text-gray-400">
                  {lecture.duration} sec
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
