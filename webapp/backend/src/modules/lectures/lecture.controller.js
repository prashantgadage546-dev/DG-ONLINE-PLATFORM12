const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/db');

const removeVideoIfLocal = (videoUrl) => {
  if (!videoUrl || !videoUrl.startsWith('/uploads/videos/')) {
    return;
  }
  const filePath = path.join(__dirname, '..', '..', '..', videoUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const recalculateEnrollmentProgress = async (userId, courseId) => {
  const [completedCount] = await pool.query(
    `
    SELECT COUNT(*) as count
    FROM lecture_progress
    WHERE user_id = ?
      AND lecture_id IN (SELECT id FROM lectures WHERE course_id = ?)
      AND completed = TRUE
    `,
    [userId, courseId]
  );

  const [totalCount] = await pool.query(
    'SELECT COUNT(*) as count FROM lectures WHERE course_id = ?',
    [courseId]
  );

  const completed = completedCount[0].count;
  const total = totalCount[0].count;
  const progressPercentage = total > 0 ? (completed / total * 100).toFixed(2) : 0;

  await pool.query(
    `
    UPDATE enrollments
    SET completed_lessons = ?, total_lessons = ?, progress = ?
    WHERE user_id = ? AND course_id = ?
    `,
    [completed, total, progressPercentage, userId, courseId]
  );

  return { completed, total, progress: progressPercentage };
};

exports.listVideos = async (req, res) => {
  try {
    const { q = '', course_id, topic_id } = req.query;

    let query = `
      SELECT
        l.id,
        l.title,
        l.description,
        l.video_url,
        l.duration,
        l.order_number,
        l.created_at,
        l.course_id,
        c.title AS course_title,
        l.topic_id,
        t.name AS topic_name
      FROM lectures l
      JOIN courses c ON c.id = l.course_id
      LEFT JOIN topics t ON t.id = l.topic_id
      WHERE (l.title LIKE ? OR COALESCE(l.description, '') LIKE ?)
    `;

    const values = [`%${q}%`, `%${q}%`];

    if (course_id) {
      query += ' AND l.course_id = ?';
      values.push(course_id);
    }

    if (topic_id) {
      query += ' AND l.topic_id = ?';
      values.push(topic_id);
    }

    query += ' ORDER BY l.created_at DESC';

    const [videos] = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos',
    });
  }
};

exports.getCourseLectures = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const [lectures] = await pool.query(
      `
      SELECT l.*, t.name AS topic_name
      FROM lectures l
      LEFT JOIN topics t ON t.id = l.topic_id
      WHERE l.course_id = ?
      ORDER BY l.order_number ASC
      `,
      [courseId]
    );

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures,
    });
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lectures',
    });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const { course_id, topic_id, title, description, video_url, duration, order_number } = req.body;

    if (!course_id || !title || !order_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course_id, title and order_number',
      });
    }

    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE id = ?',
      [course_id]
    );

    if (!courses.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO lectures (course_id, topic_id, title, description, video_url, duration, order_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [course_id, topic_id || null, title, description || null, video_url, duration || 0, order_number]
    );

    await pool.query(
      `
      UPDATE enrollments
      SET total_lessons = (SELECT COUNT(*) FROM lectures WHERE course_id = ?)
      WHERE course_id = ?
      `,
      [course_id, course_id]
    );

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: lectures[0],
    });
  } catch (error) {
    console.error('Create lecture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating lecture',
    });
  }
};

exports.uploadLectureVideo = async (req, res) => {
  try {
    const { course_id, topic_id, title, description, duration, order_number } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'MP4 video file is required',
      });
    }

    if (!course_id || !topic_id || !title) {
      removeVideoIfLocal(`/uploads/videos/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'course_id, topic_id and title are required',
      });
    }

    const [topics] = await pool.query(
      'SELECT id, course_id FROM topics WHERE id = ?',
      [topic_id]
    );

    if (!topics.length || Number(topics[0].course_id) !== Number(course_id)) {
      removeVideoIfLocal(`/uploads/videos/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Topic is invalid for the selected course',
      });
    }

    const [maxOrderRows] = await pool.query(
      'SELECT COALESCE(MAX(order_number), 0) AS maxOrder FROM lectures WHERE course_id = ?',
      [course_id]
    );
    const resolvedOrder = order_number ? Number(order_number) : Number(maxOrderRows[0].maxOrder) + 1;

    const videoPath = `/uploads/videos/${req.file.filename}`;
    const [result] = await pool.query(
      `
      INSERT INTO lectures (course_id, topic_id, title, description, video_url, duration, order_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [course_id, topic_id, title, description || null, videoPath, duration || 0, resolvedOrder]
    );

    await pool.query(
      `
      UPDATE enrollments
      SET total_lessons = (SELECT COUNT(*) FROM lectures WHERE course_id = ?)
      WHERE course_id = ?
      `,
      [course_id, course_id]
    );

    const [rows] = await pool.query(
      `
      SELECT l.*, c.title AS course_title, t.name AS topic_name
      FROM lectures l
      JOIN courses c ON c.id = l.course_id
      LEFT JOIN topics t ON t.id = l.topic_id
      WHERE l.id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: rows[0],
    });
  } catch (error) {
    if (req.file) {
      removeVideoIfLocal(`/uploads/videos/${req.file.filename}`);
    }
    console.error('Upload lecture video error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error uploading video',
    });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const { title, description, topic_id, duration, order_number } = req.body;

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (!lectures.length) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const current = lectures[0];
    const nextTopic = topic_id !== undefined ? topic_id : current.topic_id;

    if (nextTopic) {
      const [topics] = await pool.query(
        'SELECT id, course_id FROM topics WHERE id = ?',
        [nextTopic]
      );
      if (!topics.length || Number(topics[0].course_id) !== Number(current.course_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic for this course',
        });
      }
    }

    await pool.query(
      `
      UPDATE lectures
      SET title = ?, description = ?, topic_id = ?, duration = ?, order_number = ?
      WHERE id = ?
      `,
      [
        title ?? current.title,
        description ?? current.description,
        nextTopic || null,
        duration ?? current.duration,
        order_number ?? current.order_number,
        lectureId,
      ]
    );

    const [updatedLectures] = await pool.query(
      `
      SELECT l.*, c.title AS course_title, t.name AS topic_name
      FROM lectures l
      JOIN courses c ON c.id = l.course_id
      LEFT JOIN topics t ON t.id = l.topic_id
      WHERE l.id = ?
      `,
      [lectureId]
    );

    return res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      data: updatedLectures[0],
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating lecture',
    });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (!lectures.length) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const { course_id: courseId, video_url: videoUrl } = lectures[0];

    await pool.query('DELETE FROM lectures WHERE id = ?', [lectureId]);
    removeVideoIfLocal(videoUrl);

    await pool.query(
      `
      UPDATE enrollments
      SET total_lessons = (SELECT COUNT(*) FROM lectures WHERE course_id = ?)
      WHERE course_id = ?
      `,
      [courseId, courseId]
    );

    return res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting lecture',
    });
  }
};

exports.updateLectureProgress = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const userId = req.user.id;
    const { watched_seconds = 0, last_position = 0, duration = 0 } = req.body;

    const [lectures] = await pool.query(
      'SELECT id, course_id FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (!lectures.length) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const courseId = lectures[0].course_id;

    const [enrollments] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (!enrollments.length) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    await pool.query(
      `
      INSERT INTO lecture_progress (user_id, lecture_id, completed, watched_seconds, last_position)
      VALUES (?, ?, FALSE, ?, ?)
      ON DUPLICATE KEY UPDATE
        watched_seconds = GREATEST(COALESCE(watched_seconds, 0), VALUES(watched_seconds)),
        last_position = VALUES(last_position)
      `,
      [userId, lectureId, Number(watched_seconds) || 0, Number(last_position) || 0]
    );

    const progress = await recalculateEnrollmentProgress(userId, courseId);

    return res.status(200).json({
      success: true,
      message: 'Progress saved',
      data: {
        lecture_id: Number(lectureId),
        watched_seconds: Number(watched_seconds) || 0,
        last_position: Number(last_position) || 0,
        duration: Number(duration) || 0,
        course_progress: progress,
      },
    });
  } catch (error) {
    console.error('Update lecture progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating lecture progress',
    });
  }
};

exports.completeLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const userId = req.user.id;

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (!lectures.length) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const lecture = lectures[0];
    const courseId = lecture.course_id;

    const [enrollments] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (!enrollments.length) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    await pool.query(
      `
      INSERT INTO lecture_progress (user_id, lecture_id, completed, completed_at, watched_seconds, last_position)
      VALUES (?, ?, TRUE, NOW(), ?, ?)
      ON DUPLICATE KEY UPDATE
        completed = TRUE,
        completed_at = NOW(),
        watched_seconds = GREATEST(COALESCE(watched_seconds, 0), VALUES(watched_seconds)),
        last_position = VALUES(last_position)
      `,
      [userId, lectureId, lecture.duration || 0, lecture.duration || 0]
    );

    const progress = await recalculateEnrollmentProgress(userId, courseId);

    return res.status(200).json({
      success: true,
      message: 'Lecture marked as completed',
      data: progress,
    });
  } catch (error) {
    console.error('Complete lecture error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking lecture as completed',
    });
  }
};
