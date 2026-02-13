'use client';

import { Link } from 'react-router-dom';
import { Clock, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';

interface CourseCardProps {
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

export function CourseCard({
  id,
  title,
  description,
  thumbnail,
  instructor_name,
  lecture_count,
  progress,
  completed_lessons,
  total_lessons
}: CourseCardProps) {
  return (
    <Link to={`/courses/${id}`}>
      <Card className="overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 group">
        <div className="relative h-48 w-full bg-navy-700 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-16 w-16 text-gray-500" />
            </div>
          )}
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-xl">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {instructor_name && (
            <p className="text-sm text-blue-400 mb-3">
              By {instructor_name}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            {lecture_count !== undefined && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{lecture_count} lectures</span>
              </div>
            )}
            {total_lessons !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{total_lessons} lessons</span>
              </div>
            )}
          </div>
        </CardContent>

        {progress !== undefined && (
          <CardFooter className="p-6 pt-0 border-t border-navy-700">
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-navy-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {completed_lessons !== undefined && total_lessons !== undefined && (
                <p className="text-xs text-gray-500 mt-2">
                  {completed_lessons} of {total_lessons} completed
                </p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
