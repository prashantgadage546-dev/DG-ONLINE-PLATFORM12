const { pool } = require('../../config/db');

exports.getUsers = async (req, res) => {
  try {
    const { q = '', role } = req.query;
    const values = [`%${q}%`, `%${q}%`];

    let whereClause = `
      WHERE (u.name LIKE ? OR u.email LIKE ?)
    `;

    if (role && ['admin', 'student'].includes(role)) {
      whereClause += ' AND u.role = ?';
      values.push(role);
    }

    const [users] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT e.id) AS enrolled_courses,
        COALESCE(SUM(e.completed_lessons), 0) AS completed_lessons
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      `,
      values
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin or student',
      });
    }

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role',
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
    });
  }
};
