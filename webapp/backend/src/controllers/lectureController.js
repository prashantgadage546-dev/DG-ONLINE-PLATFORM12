const { pool } = require('../config/db');

// @desc    Get lectures for a course
// @route   GET /api/lectures/:courseId
// @access  Public
exports.getCourseLectures = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const [lectures] = await pool.query(`
      SELECT * FROM lectures 
      WHERE course_id = ? 
      ORDER BY order_number ASC
    `, [courseId]);

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lectures'
    });
  }
};

// @desc    Create lecture
// @route   POST /api/lectures
// @access  Private/Admin
exports.createLecture = async (req, res) => {
  try {
    const { course_id, title, video_url, duration, order_number } = req.body;

    if (!course_id || !title || !order_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course_id, title and order_number'
      });
    }

    // Check if course exists
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES (?, ?, ?, ?, ?)',
      [course_id, title, video_url, duration || 0, order_number]
    );

    // Update total_lessons in enrollments
    await pool.query(`
      UPDATE enrollments 
      SET total_lessons = (SELECT COUNT(*) FROM lectures WHERE course_id = ?)
      WHERE course_id = ?
    `, [course_id, course_id]);

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: lectures[0]
    });
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating lecture'
    });
  }
};

// @desc    Update lecture
// @route   PUT /api/lectures/:id
// @access  Private/Admin
exports.updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const { title, video_url, duration, order_number } = req.body;

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (lectures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    await pool.query(
      'UPDATE lectures SET title = ?, video_url = ?, duration = ?, order_number = ? WHERE id = ?',
      [title, video_url, duration, order_number, lectureId]
    );

    const [updatedLectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      data: updatedLectures[0]
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lecture'
    });
  }
};

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
// @access  Private/Admin
exports.deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;

    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (lectures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    const courseId = lectures[0].course_id;

    await pool.query('DELETE FROM lectures WHERE id = ?', [lectureId]);

    // Update total_lessons in enrollments
    await pool.query(`
      UPDATE enrollments 
      SET total_lessons = (SELECT COUNT(*) FROM lectures WHERE course_id = ?)
      WHERE course_id = ?
    `, [courseId, courseId]);

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting lecture'
    });
  }
};

// @desc    Mark lecture as completed
// @route   POST /api/lectures/:id/complete
// @access  Private
exports.completeLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const userId = req.user.id;

    // Check if lecture exists
    const [lectures] = await pool.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    );

    if (lectures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    const courseId = lectures[0].course_id;

    // Check if user is enrolled
    const [enrollments] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if already completed
    const [progress] = await pool.query(
      'SELECT * FROM lecture_progress WHERE user_id = ? AND lecture_id = ?',
      [userId, lectureId]
    );

    if (progress.length === 0) {
      // Insert new progress
      await pool.query(
        'INSERT INTO lecture_progress (user_id, lecture_id, completed, completed_at) VALUES (?, ?, TRUE, NOW())',
        [userId, lectureId]
      );
    } else if (!progress[0].completed) {
      // Update existing progress
      await pool.query(
        'UPDATE lecture_progress SET completed = TRUE, completed_at = NOW() WHERE user_id = ? AND lecture_id = ?',
        [userId, lectureId]
      );
    }

    // Update enrollment progress
    const [completedCount] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM lecture_progress 
      WHERE user_id = ? AND lecture_id IN (SELECT id FROM lectures WHERE course_id = ?) AND completed = TRUE
    `, [userId, courseId]);

    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as count FROM lectures WHERE course_id = ?',
      [courseId]
    );

    const completed = completedCount[0].count;
    const total = totalCount[0].count;
    const progressPercentage = total > 0 ? (completed / total * 100).toFixed(2) : 0;

    await pool.query(
      'UPDATE enrollments SET completed_lessons = ?, total_lessons = ?, progress = ? WHERE user_id = ? AND course_id = ?',
      [completed, total, progressPercentage, userId, courseId]
    );

    res.status(200).json({
      success: true,
      message: 'Lecture marked as completed',
      data: {
        completed,
        total,
        progress: progressPercentage
      }
    });
  } catch (error) {
    console.error('Complete lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking lecture as completed'
    });
  }
};
