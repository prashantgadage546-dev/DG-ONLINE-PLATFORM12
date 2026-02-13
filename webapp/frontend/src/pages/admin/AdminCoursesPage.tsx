'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, Edit, Upload, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  description?: string;
  instructor_name?: string;
}

interface Topic {
  id: number;
  name: string;
  course_id: number;
  description?: string;
}

interface Video {
  id: number;
  title: string;
  description?: string;
  course_id: number;
  course_title: string;
  topic_id: number | null;
  topic_name?: string;
  duration: number;
  order_number: number;
  video_url: string;
  created_at: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date?: string | null;
  topic_name: string;
  course_title: string;
  submission_count: number;
}

export default function AdminCoursesPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topicMap, setTopicMap] = useState<Record<number, Topic[]>>({});

  const [search, setSearch] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
  });
  const [topicForm, setTopicForm] = useState({
    course_id: '',
    name: '',
    description: '',
  });
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    course_id: '',
    topic_id: '',
    duration: '',
    order_number: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    course_id: '',
    topic_id: '',
    title: '',
    description: '',
    due_date: '',
  });

  const selectedCourseTopics = useMemo(() => {
    const id = Number(videoForm.course_id);
    if (!id) return [];
    return topicMap[id] || [];
  }, [videoForm.course_id, topicMap]);

  const selectedAssignmentTopics = useMemo(() => {
    const id = Number(assignmentForm.course_id);
    if (!id) return [];
    return topicMap[id] || [];
  }, [assignmentForm.course_id, topicMap]);

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

    bootstrap();
  }, [navigate]);

  const bootstrap = async () => {
    setLoading(true);
    await Promise.all([fetchCourses(), fetchVideos(), fetchAssignments()]);
    setLoading(false);
  };

  const fetchCourses = async () => {
    const response = await api.get('/courses');
    if (!response.data.success) return;
    const nextCourses = response.data.data || [];
    setCourses(nextCourses);

    const entries = await Promise.all(
      nextCourses.map(async (course: Course) => {
        try {
          const topicsRes = await api.get(`/topics?course_id=${course.id}`);
          return [course.id, topicsRes.data?.data || []] as [number, Topic[]];
        } catch (error) {
          console.error(`Error loading topics for course ${course.id}:`, error);
          return [course.id, []] as [number, Topic[]];
        }
      })
    );

    setTopicMap(Object.fromEntries(entries));
  };

  const fetchVideos = async (keyword?: string) => {
    const query = keyword || search;
    const response = await api.get('/lectures', {
      params: { q: query || undefined },
    });
    if (response.data.success) {
      setVideos(response.data.data || []);
    }
  };

  const fetchAssignments = async () => {
    const response = await api.get('/assignments/admin');
    if (response.data.success) {
      setAssignments(response.data.data || []);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.post('/courses', courseForm);
    if (!response.data.success) return;
    setShowCourseModal(false);
    setCourseForm({ title: '', description: '', thumbnail: '' });
    await fetchCourses();
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.post('/topics', {
      course_id: Number(topicForm.course_id),
      name: topicForm.name,
      description: topicForm.description,
    });
    if (!response.data.success) return;
    setTopicForm({ course_id: '', name: '', description: '' });
    await fetchCourses();
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    const payload = new FormData();
    payload.append('video', videoFile);
    payload.append('title', videoForm.title);
    payload.append('description', videoForm.description);
    payload.append('course_id', videoForm.course_id);
    payload.append('topic_id', videoForm.topic_id);
    if (videoForm.duration) payload.append('duration', videoForm.duration);
    if (videoForm.order_number) payload.append('order_number', videoForm.order_number);

    const response = await api.post('/lectures/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) return;
    setShowVideoModal(false);
    setVideoFile(null);
    setVideoForm({
      title: '',
      description: '',
      course_id: '',
      topic_id: '',
      duration: '',
      order_number: '',
    });
    await fetchVideos();
    await fetchCourses();
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const response = await api.put(`/lectures/${editingVideo.id}`, {
      title: editingVideo.title,
      description: editingVideo.description,
      topic_id: editingVideo.topic_id,
      duration: editingVideo.duration,
      order_number: editingVideo.order_number,
    });

    if (!response.data.success) return;
    setShowEditModal(false);
    setEditingVideo(null);
    await fetchVideos();
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('Delete this video?')) return;
    await api.delete(`/lectures/${id}`);
    await fetchVideos();
    await fetchCourses();
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.post('/assignments', {
      topic_id: Number(assignmentForm.topic_id),
      title: assignmentForm.title,
      description: assignmentForm.description,
      due_date: assignmentForm.due_date || null,
    });

    if (!response.data.success) return;
    setAssignmentForm({
      course_id: '',
      topic_id: '',
      title: '',
      description: '',
      due_date: '',
    });
    await fetchAssignments();
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
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Course & Video Management</h1>
                <p className="text-gray-400">Manage courses, topics, and uploaded videos</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowCourseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
                <Button onClick={() => setShowVideoModal(true)} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTopic} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    required
                    className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                    value={topicForm.course_id}
                    onChange={(e) => setTopicForm({ ...topicForm, course_id: e.target.value })}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <Input
                    required
                    placeholder="Topic name"
                    value={topicForm.name}
                    onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  />
                  <Button type="submit">Create Topic</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select
                    required
                    className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                    value={assignmentForm.course_id}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, course_id: e.target.value, topic_id: '' })
                    }
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                    value={assignmentForm.topic_id}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, topic_id: e.target.value })}
                  >
                    <option value="">Select topic</option>
                    {selectedAssignmentTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    required
                    placeholder="Assignment title"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  />
                  <Input
                    type="datetime-local"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  />
                  <Button type="submit">Create Assignment</Button>
                  <div className="md:col-span-5">
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                      placeholder="Assignment description"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-700 text-left text-gray-400">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Course</th>
                        <th className="pb-3">Topic</th>
                        <th className="pb-3">Due</th>
                        <th className="pb-3">Submissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-navy-700/50">
                          <td className="py-3 text-white">{assignment.title}</td>
                          <td className="py-3 text-gray-300">{assignment.course_title}</td>
                          <td className="py-3 text-gray-300">{assignment.topic_name}</td>
                          <td className="py-3 text-gray-300">
                            {assignment.due_date
                              ? new Date(assignment.due_date).toLocaleString()
                              : 'No deadline'}
                          </td>
                          <td className="py-3 text-gray-300">{assignment.submission_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>All Videos</CardTitle>
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      placeholder="Search videos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchVideos((e.target as HTMLInputElement).value);
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-700 text-left text-gray-400">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Course</th>
                        <th className="pb-3">Topic</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Created</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video) => (
                        <tr key={video.id} className="border-b border-navy-700/50">
                          <td className="py-3 text-white">{video.title}</td>
                          <td className="py-3 text-gray-300">{video.course_title}</td>
                          <td className="py-3 text-gray-300">{video.topic_name || '-'}</td>
                          <td className="py-3 text-gray-300">{video.duration || 0}s</td>
                          <td className="py-3 text-gray-400">{new Date(video.created_at).toLocaleDateString()}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingVideo(video);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Course</CardTitle>
                <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <Input
                  required
                  placeholder="Course title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
                <textarea
                  required
                  className="w-full px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                  rows={4}
                  placeholder="Description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
                <Input
                  placeholder="Thumbnail URL"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                />
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload MP4 Video</CardTitle>
                <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  placeholder="Video title"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                />
                <Input
                  placeholder="Duration (seconds)"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                />
                <select
                  required
                  className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                  value={videoForm.course_id}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, course_id: e.target.value, topic_id: '' })
                  }
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <select
                  required
                  className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                  value={videoForm.topic_id}
                  onChange={(e) => setVideoForm({ ...videoForm, topic_id: e.target.value })}
                >
                  <option value="">Select topic</option>
                  {selectedCourseTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Order number"
                  value={videoForm.order_number}
                  onChange={(e) => setVideoForm({ ...videoForm, order_number: e.target.value })}
                />
                <input
                  required
                  type="file"
                  accept="video/mp4"
                  className="px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                <div className="md:col-span-2">
                  <textarea
                    className="w-full px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                    rows={4}
                    placeholder="Video description"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full">
                    Upload Video
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditModal && editingVideo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Video</CardTitle>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateVideo} className="space-y-4">
                <Input
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-2.5 border-2 border-navy-700 bg-navy-800/50 text-white rounded-xl"
                  rows={4}
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                />
                <Input
                  type="number"
                  value={editingVideo.duration || 0}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, duration: Number(e.target.value || 0) })
                  }
                />
                <Input
                  type="number"
                  value={editingVideo.order_number || 1}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, order_number: Number(e.target.value || 1) })
                  }
                />
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
