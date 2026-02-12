const { pool } = require('../config/db');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT 
        c.*,
        u.name as instructor_name,
        COUNT(DISTINCT l.id) as lecture_count,
        COUNT(DISTINCT e.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN lectures l ON c.id = l.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const [courses] = await pool.query(`
      SELECT 
        c.*,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [courseId]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get lectures for this course
    const [lectures] = await pool.query(`
      SELECT * FROM lectures 
      WHERE course_id = ? 
      ORDER BY order_number ASC
    `, [courseId]);

    const course = {
      ...courses[0],
      lectures
    };

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course'
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course title'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO courses (title, description, thumbnail, created_by) VALUES (?, ?, ?, ?)',
      [title, description, thumbnail, req.user.id]
    );

    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: courses[0]
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, thumbnail } = req.body;

    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await pool.query(
      'UPDATE courses SET title = ?, description = ?, thumbnail = ? WHERE id = ?',
      [title, description, thumbnail, courseId]
    );

    const [updatedCourses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourses[0]
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course'
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Check if course exists
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const [enrollments] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (enrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Get total lectures count
    const [lectures] = await pool.query(
      'SELECT COUNT(*) as count FROM lectures WHERE course_id = ?',
      [courseId]
    );

    const totalLectures = lectures[0].count;

    // Create enrollment
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id, total_lessons) VALUES (?, ?, ?)',
      [userId, courseId, totalLectures]
    );

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully'
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error enrolling in course'
    });
  }
};
