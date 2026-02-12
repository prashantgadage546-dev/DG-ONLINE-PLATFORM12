const { pool } = require('../config/db');

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private/Student
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enrolled courses with progress
    const [enrolledCourses] = await pool.query(`
      SELECT 
        e.*,
        c.title,
        c.description,
        c.thumbnail,
        u.name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.created_by = u.id
      WHERE e.user_id = ?
      ORDER BY e.updated_at DESC
    `, [userId]);

    // Calculate total stats
    const totalEnrolled = enrolledCourses.length;
    let totalLessons = 0;
    let completedLessons = 0;

    enrolledCourses.forEach(course => {
      totalLessons += course.total_lessons;
      completedLessons += course.completed_lessons;
    });

    const overallProgress = totalLessons > 0 
      ? ((completedLessons / totalLessons) * 100).toFixed(2) 
      : 0;

    // Get recent activity (recently updated enrollments)
    const recentCourses = enrolledCourses.slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEnrolled,
          totalLessons,
          completedLessons,
          overallProgress
        },
        enrolledCourses,
        recentCourses
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get total users
    const [userCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get total courses
    const [courseCount] = await pool.query(
      'SELECT COUNT(*) as count FROM courses'
    );

    // Get total enrollments
    const [enrollmentCount] = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get student count
    const [studentCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );

    // Get recent courses
    const [recentCourses] = await pool.query(`
      SELECT 
        c.*,
        u.name as instructor_name,
        COUNT(DISTINCT e.id) as enrollment_count,
        COUNT(DISTINCT l.id) as lecture_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN lectures l ON c.id = l.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    // Dummy revenue calculation (for demo purposes)
    const revenue = enrollmentCount[0].count * 49.99; // $49.99 per enrollment

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount[0].count,
          totalCourses: courseCount[0].count,
          totalEnrollments: enrollmentCount[0].count,
          totalStudents: studentCount[0].count,
          revenue: revenue.toFixed(2)
        },
        recentCourses
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get course progress for student
// @route   GET /api/dashboard/course/:courseId/progress
// @access  Private
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    // Get enrollment
    const [enrollments] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get lectures with completion status
    const [lectures] = await pool.query(`
      SELECT 
        l.*,
        COALESCE(lp.completed, FALSE) as completed,
        lp.completed_at
      FROM lectures l
      LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_number ASC
    `, [userId, courseId]);

    res.status(200).json({
      success: true,
      data: {
        enrollment: enrollments[0],
        lectures
      }
    });
  } catch (error) {
    console.error('Course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course progress'
    });
  }
};
