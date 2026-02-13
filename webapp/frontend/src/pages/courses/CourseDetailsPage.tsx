'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '@/lib/api';
import { ArrowLeft, ChevronDown, ChevronRight, PlayCircle, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Lecture {
  id: number;
  topic_id: number | null;
  title: string;
  description?: string;
  video_url: string;
  duration: number;
  completed?: boolean;
  watched_seconds?: number;
  last_position?: number;
}

interface Topic {
  id: number;
  name: string;
  lectures: Lecture[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  topics: Topic[];
}

interface Assignment {
  id: number;
  topic_id: number;
  title: string;
  description: string;
  due_date?: string | null;
}

interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  submission_text?: string | null;
  submission_url?: string | null;
  status: 'submitted' | 'reviewed';
  submitted_at?: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const backendOrigin = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
const toVideoUrl = (url: string) => (url?.startsWith('/uploads/') ? `${backendOrigin}${url}` : url);

export default function CourseDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({});
  const [savingProgress, setSavingProgress] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [topicAssignment, setTopicAssignment] = useState<Assignment | null>(null);
  const [topicAssignmentSubmission, setTopicAssignmentSubmission] = useState<AssignmentSubmission | null>(null);
  const [assignmentUnlocked, setAssignmentUnlocked] = useState(false);
  const [assignmentProgressLabel, setAssignmentProgressLabel] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    submission_text: '',
    submission_url: '',
  });
  const [loading, setLoading] = useState(true);
  const lastProgressSaveAt = useRef(0);
  const pendingSeekSeconds = useRef<number | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  const allLectures = useMemo(
    () => (course?.topics || []).flatMap((topic) => topic.lectures || []),
    [course]
  );

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        if (!res.data.success) return;

        const fetchedCourse: Course = res.data.data;
        setCourse(fetchedCourse);

        const firstTopic = fetchedCourse.topics?.[0];
        const firstLecture = firstTopic?.lectures?.[0] || null;
        setSelectedLecture(firstLecture);
        if (firstTopic?.id) {
          setOpenTopics({ [firstTopic.id]: true });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!selectedLecture) return;
    pendingSeekSeconds.current = selectedLecture.last_position || 0;
  }, [selectedLecture?.id]);

  useEffect(() => {
    const topicId = selectedLecture?.topic_id;
    if (!topicId) {
      setTopicAssignment(null);
      setTopicAssignmentSubmission(null);
      setAssignmentUnlocked(false);
      setAssignmentProgressLabel('');
      return;
    }

    fetchTopicAssignment(topicId);
  }, [selectedLecture?.topic_id]);

  useEffect(() => {
    const key = `course-notes-${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, [id]);

  const refreshCourse = async () => {
    const res = await api.get(`/courses/${id}`);
    if (!res.data.success) return;
    const nextCourse: Course = res.data.data;
    setCourse(nextCourse);
    if (!selectedLecture) return;
    const updated = nextCourse.topics
      .flatMap((topic) => topic.lectures)
      .find((lecture) => lecture.id === selectedLecture.id);
    if (updated) setSelectedLecture(updated);
  };

  const fetchTopicAssignment = async (topicId: number) => {
    try {
      setAssignmentLoading(true);
      const res = await api.get(`/assignments/topic/${topicId}`);
      if (!res.data.success) return;

      const payload = res.data.data;
      const completion = payload?.completion;
      const unlocked = Boolean(completion?.unlocked);
      setAssignmentUnlocked(unlocked);
      setAssignmentProgressLabel(
        `Topic progress: ${completion?.completedLectures || 0}/${completion?.totalLectures || 0} videos completed`
      );

      setTopicAssignment(payload?.assignment || null);
      setTopicAssignmentSubmission(payload?.submission || null);
      setAssignmentForm({
        submission_text: payload?.submission?.submission_text || '',
        submission_url: payload?.submission?.submission_url || '',
      });
    } catch (error) {
      console.error('Error fetching topic assignment:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleSaveProgress = async (seconds: number, force = false) => {
    if (!selectedLecture) return;
    const now = Date.now();
    if (!force && now - lastProgressSaveAt.current < 5000) return;
    lastProgressSaveAt.current = now;

    try {
      setSavingProgress(true);
      await api.put(`/lectures/${selectedLecture.id}/progress`, {
        watched_seconds: Math.floor(seconds),
        last_position: Math.floor(seconds),
        duration: selectedLecture.duration || 0,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedLecture) return;
    try {
      await api.post(`/lectures/${selectedLecture.id}/complete`);
      await refreshCourse();
    } catch (error) {
      console.error('Error marking lecture complete:', error);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedLecture) return;
    localStorage.setItem(`course-notes-${id}`, JSON.stringify(notes));
  };

  const selectNextLecture = () => {
    if (!selectedLecture) return;
    const idx = allLectures.findIndex((lecture) => lecture.id === selectedLecture.id);
    if (idx >= 0 && idx + 1 < allLectures.length) {
      setSelectedLecture(allLectures[idx + 1]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!topicAssignment) return;
    if (!assignmentForm.submission_text && !assignmentForm.submission_url) return;

    try {
      setAssignmentSubmitting(true);
      const res = await api.post(`/assignments/${topicAssignment.id}/submit`, assignmentForm);
      if (res.data.success) {
        setTopicAssignmentSubmission(res.data.data);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setAssignmentSubmitting(false);
    }
  };

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
      <div className="px-8 py-6 border-b border-navy-700">
        <Link to="/courses" className="flex items-center gap-2 text-blue-400 hover:text-blue-500 mb-4">
          <ArrowLeft size={16} />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-400 max-w-3xl">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
        <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
          <h3 className="text-lg font-semibold mb-4">Topics</h3>
          {course.topics?.length === 0 && <p className="text-gray-400 text-sm">No topics available.</p>}

          <div className="space-y-3">
            {course.topics?.map((topic) => {
              const isOpen = !!openTopics[topic.id];
              return (
                <div key={topic.id} className="border border-navy-700 rounded-lg overflow-hidden">
                  <button
                    className="w-full px-3 py-2 bg-navy-700 hover:bg-navy-600 flex items-center justify-between text-left"
                    onClick={() => setOpenTopics((prev) => ({ ...prev, [topic.id]: !isOpen }))}
                  >
                    <span className="font-medium">{topic.name}</span>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <div className="p-2 space-y-2 bg-navy-800">
                      {topic.lectures?.map((lecture) => (
                        <button
                          key={lecture.id}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            selectedLecture?.id === lecture.id
                              ? 'bg-blue-600'
                              : 'bg-navy-700 hover:bg-navy-600'
                          }`}
                          onClick={() => setSelectedLecture(lecture)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm">{lecture.title}</span>
                            {lecture.completed && (
                              <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full">Done</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {selectedLecture ? (
              <ReactPlayer
                ref={(player) => {
                  playerRef.current = player;
                }}
                url={toVideoUrl(selectedLecture.video_url)}
                controls
                playing
                width="100%"
                height="100%"
                onReady={() => {
                  const seekTo = pendingSeekSeconds.current;
                  if (seekTo && playerRef.current) {
                    playerRef.current.seekTo(seekTo, 'seconds');
                  }
                  pendingSeekSeconds.current = null;
                }}
                onProgress={({ playedSeconds }) => {
                  handleSaveProgress(playedSeconds);
                }}
                onPause={() => {
                  if (playerRef.current) {
                    const current = playerRef.current.getCurrentTime();
                    handleSaveProgress(current, true);
                  }
                }}
                onEnded={() => {
                  handleMarkCompleted();
                  if (autoPlayNext) {
                    selectNextLecture();
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <PlayCircle size={64} />
                <p>No lecture selected</p>
              </div>
            )}
          </div>

          {selectedLecture && (
            <div className="bg-navy-800 rounded-xl p-5 border border-navy-700">
              <h2 className="text-xl font-semibold mb-2">{selectedLecture.title}</h2>
              <p className="text-gray-400 text-sm mb-4">{selectedLecture.description || 'No description provided.'}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Duration: {selectedLecture.duration || 0}s | Progress save: {savingProgress ? 'Saving...' : 'Live'}
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-300 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoPlayNext}
                      onChange={(e) => setAutoPlayNext(e.target.checked)}
                    />
                    Autoplay next
                  </label>
                  <Button onClick={handleMarkCompleted} disabled={!!selectedLecture.completed}>
                    {selectedLecture.completed ? 'Completed' : 'Mark as Completed'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedLecture && (
            <div className="bg-navy-800 rounded-xl p-5 border border-navy-700">
              <h3 className="text-lg font-semibold text-white mb-2">Topic Assignment</h3>
              {assignmentLoading ? (
                <p className="text-sm text-gray-400">Loading assignment...</p>
              ) : !topicAssignment ? (
                <p className="text-sm text-gray-400">No assignment added for this topic yet.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-white font-medium">{topicAssignment.title}</p>
                    <p className="text-sm text-gray-400 mt-1">{topicAssignment.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{assignmentProgressLabel}</p>
                    <p className="text-xs text-gray-400">
                      Due:{' '}
                      {topicAssignment.due_date
                        ? new Date(topicAssignment.due_date).toLocaleString()
                        : 'No deadline'}
                    </p>
                  </div>

                  {!assignmentUnlocked && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                      Complete all videos in this topic to unlock assignment submission.
                    </div>
                  )}

                  {assignmentUnlocked && (
                    <>
                      <textarea
                        value={assignmentForm.submission_text}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, submission_text: e.target.value }))
                        }
                        placeholder="Write your assignment answer..."
                        className="w-full px-4 py-3 border-2 border-navy-700 bg-navy-900/50 text-white rounded-xl min-h-28"
                      />
                      <input
                        value={assignmentForm.submission_url}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, submission_url: e.target.value }))
                        }
                        placeholder="Submission URL (GitHub/Drive/etc)"
                        className="w-full px-4 py-2.5 border-2 border-navy-700 bg-navy-900/50 text-white rounded-xl"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {topicAssignmentSubmission
                            ? `Submitted on ${new Date(
                                topicAssignmentSubmission.submitted_at || ''
                              ).toLocaleString()}`
                            : 'Not submitted yet'}
                        </p>
                        <Button onClick={handleSubmitAssignment} disabled={assignmentSubmitting}>
                          {assignmentSubmitting
                            ? 'Submitting...'
                            : topicAssignmentSubmission
                              ? 'Update Submission'
                              : 'Submit Assignment'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedLecture && (
            <div className="bg-navy-800 rounded-xl p-5 border border-navy-700">
              <div className="flex items-center gap-2 mb-3">
                <NotebookPen className="h-4 w-4 text-blue-400" />
                <p className="font-medium text-white">Personal Notes</p>
              </div>
              <textarea
                value={notes[selectedLecture.id] || ''}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [selectedLecture.id]: e.target.value }))
                }
                placeholder="Write key takeaways, doubts, and revision points..."
                className="w-full px-4 py-3 border-2 border-navy-700 bg-navy-900/50 text-white rounded-xl min-h-28"
              />
              <div className="flex justify-end mt-3">
                <Button variant="outline" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {allLectures.length === 0 && <p className="text-gray-400">No videos available under this course yet.</p>}
        </div>
      </div>
    </div>
  );
}
