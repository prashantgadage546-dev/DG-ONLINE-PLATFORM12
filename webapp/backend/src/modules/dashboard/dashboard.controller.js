const { pool } = require('../../config/db');

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

    const [assignmentStatsRows] = await pool.query(
      `
      SELECT
        COUNT(a.id) AS totalAssignments,
        COUNT(s.id) AS completedAssignments
      FROM assignments a
      JOIN topics t ON t.id = a.topic_id
      JOIN enrollments e ON e.course_id = t.course_id AND e.user_id = ?
      LEFT JOIN assignment_submissions s
        ON s.assignment_id = a.id
       AND s.user_id = ?
      `,
      [userId, userId]
    );

    const totalAssignments = Number(assignmentStatsRows[0]?.totalAssignments || 0);
    const completedAssignments = Number(assignmentStatsRows[0]?.completedAssignments || 0);
    const pendingAssignments = Math.max(0, totalAssignments - completedAssignments);

    const [pendingAssignmentList] = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.due_date,
        t.name AS topic_name,
        c.title AS course_title
      FROM assignments a
      JOIN topics t ON t.id = a.topic_id
      JOIN courses c ON c.id = t.course_id
      JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
      LEFT JOIN assignment_submissions s
        ON s.assignment_id = a.id
       AND s.user_id = ?
      WHERE s.id IS NULL
      ORDER BY a.due_date IS NULL, a.due_date ASC, a.created_at DESC
      LIMIT 5
      `,
      [userId, userId]
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEnrolled,
          totalLessons,
          completedLessons,
          overallProgress,
          totalAssignments,
          completedAssignments,
          pendingAssignments
        },
        enrolledCourses,
        recentCourses,
        pendingAssignmentsList: pendingAssignmentList
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

    // Get total videos
    const [videoCount] = await pool.query(
      'SELECT COUNT(*) as count FROM lectures'
    );

    // Get total completed lessons
    const [completedLessonsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM lecture_progress WHERE completed = TRUE'
    );

    const [assignmentCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM assignments'
    );

    const [assignmentSubmissionCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM assignment_submissions'
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

    const [userAssignmentStatus] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT a.id) AS assigned_count,
        COUNT(DISTINCT s.id) AS completed_count
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN topics t ON t.course_id = e.course_id
      LEFT JOIN assignments a ON a.topic_id = t.id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY completed_count DESC, assigned_count DESC
      `
    );

    const assignmentStatus = userAssignmentStatus.map((row) => {
      const assigned = Number(row.assigned_count || 0);
      const completed = Number(row.completed_count || 0);
      return {
        ...row,
        assigned_count: assigned,
        completed_count: completed,
        completion_rate: assigned > 0 ? Number(((completed / assigned) * 100).toFixed(2)) : 0,
        status: assigned > 0 && completed >= assigned ? 'completed' : 'pending',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers: userCount[0].count,
          totalCourses: courseCount[0].count,
          totalVideos: videoCount[0].count,
          totalCompletedLessons: completedLessonsCount[0].count,
          totalAssignments: assignmentCount[0].count,
          totalAssignmentSubmissions: assignmentSubmissionCount[0].count
        },
        recentCourses,
        assignmentStatus
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
