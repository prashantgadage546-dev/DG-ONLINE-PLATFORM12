const { pool } = require('../../config/db');

exports.getTopics = async (req, res) => {
  try {
    const { course_id } = req.query;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'course_id is required',
      });
    }

    const [topics] = await pool.query(
      `
      SELECT t.*, COUNT(l.id) AS video_count
      FROM topics t
      LEFT JOIN lectures l ON l.topic_id = t.id
      WHERE t.course_id = ?
      GROUP BY t.id
      ORDER BY t.created_at ASC
      `,
      [course_id]
    );

    return res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error('Get topics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching topics',
    });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { course_id, name, description } = req.body;

    if (!course_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'course_id and name are required',
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
      'INSERT INTO topics (course_id, name, description) VALUES (?, ?, ?)',
      [course_id, name, description || null]
    );

    const [topics] = await pool.query(
      'SELECT * FROM topics WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topics[0],
    });
  } catch (error) {
    console.error('Create topic error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating topic',
    });
  }
};
