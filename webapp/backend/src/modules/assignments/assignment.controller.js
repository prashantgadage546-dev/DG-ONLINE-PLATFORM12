const { pool } = require('../../config/db');

const getTopicCompletion = async (userId, topicId) => {
  const [totals] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM lectures
    WHERE topic_id = ?
    `,
    [topicId]
  );

  const totalLectures = Number(totals[0]?.total || 0);
  if (totalLectures === 0) {
    return { totalLectures: 0, completedLectures: 0, unlocked: false };
  }

  const [completedRows] = await pool.query(
    `
    SELECT COUNT(*) AS completed
    FROM lecture_progress lp
    JOIN lectures l ON l.id = lp.lecture_id
    WHERE lp.user_id = ?
      AND l.topic_id = ?
      AND lp.completed = TRUE
    `,
    [userId, topicId]
  );

  const completedLectures = Number(completedRows[0]?.completed || 0);
  return {
    totalLectures,
    completedLectures,
    unlocked: completedLectures >= totalLectures,
  };
};

exports.getTopicAssignment = async (req, res) => {
  try {
    const topicId = Number(req.params.topicId);
    const userId = req.user.id;

    const [topics] = await pool.query(
      `
      SELECT t.id, t.name, t.course_id, c.title AS course_title
      FROM topics t
      JOIN courses c ON c.id = t.course_id
      WHERE t.id = ?
      `,
      [topicId]
    );

    if (!topics.length) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    const completion = await getTopicCompletion(userId, topicId);

    const [assignments] = await pool.query(
      `
      SELECT *
      FROM assignments
      WHERE topic_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [topicId]
    );

    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        data: {
          topic: topics[0],
          completion,
          assignment: null,
          submission: null,
        },
      });
    }

    const assignment = assignments[0];

    const [submissions] = await pool.query(
      `
      SELECT *
      FROM assignment_submissions
      WHERE assignment_id = ? AND user_id = ?
      LIMIT 1
      `,
      [assignment.id, userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        topic: topics[0],
        completion,
        assignment,
        submission: submissions[0] || null,
      },
    });
  } catch (error) {
    console.error('Get topic assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching assignment',
    });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { topic_id, title, description, due_date, max_score } = req.body;

    if (!topic_id || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'topic_id, title and description are required',
      });
    }

    const [topics] = await pool.query(
      'SELECT id FROM topics WHERE id = ?',
      [topic_id]
    );

    if (!topics.length) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO assignments (topic_id, title, description, due_date, max_score, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [topic_id, title, description, due_date || null, max_score || 100, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT * FROM assignments WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating assignment',
    });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const { title, description, due_date, max_score } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM assignments WHERE id = ?',
      [assignmentId]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    const current = existing[0];
    await pool.query(
      `
      UPDATE assignments
      SET title = ?, description = ?, due_date = ?, max_score = ?
      WHERE id = ?
      `,
      [
        title ?? current.title,
        description ?? current.description,
        due_date ?? current.due_date,
        max_score ?? current.max_score,
        assignmentId,
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM assignments WHERE id = ?',
      [assignmentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating assignment',
    });
  }
};

exports.listAssignmentsForAdmin = async (req, res) => {
  try {
    const { q = '', course_id, topic_id } = req.query;

    const params = [`%${q}%`, `%${q}%`];
    let whereClause = `WHERE (a.title LIKE ? OR a.description LIKE ?)`;

    if (course_id) {
      whereClause += ' AND t.course_id = ?';
      params.push(course_id);
    }

    if (topic_id) {
      whereClause += ' AND a.topic_id = ?';
      params.push(topic_id);
    }

    const [rows] = await pool.query(
      `
      SELECT
        a.*,
        t.name AS topic_name,
        c.title AS course_title,
        COUNT(s.id) AS submission_count
      FROM assignments a
      JOIN topics t ON t.id = a.topic_id
      JOIN courses c ON c.id = t.course_id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      `,
      params
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('List assignments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching assignments',
    });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;
    const { submission_text, submission_url } = req.body;

    if (!submission_text && !submission_url) {
      return res.status(400).json({
        success: false,
        message: 'Provide submission_text or submission_url',
      });
    }

    const [assignments] = await pool.query(
      `
      SELECT a.*, t.id AS topic_id
      FROM assignments a
      JOIN topics t ON t.id = a.topic_id
      WHERE a.id = ?
      `,
      [assignmentId]
    );

    if (!assignments.length) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    const assignment = assignments[0];
    const completion = await getTopicCompletion(userId, assignment.topic_id);
    if (!completion.unlocked) {
      return res.status(400).json({
        success: false,
        message: 'Complete all lectures in this topic to unlock assignment submission',
      });
    }

    await pool.query(
      `
      INSERT INTO assignment_submissions (assignment_id, user_id, submission_text, submission_url, status, submitted_at)
      VALUES (?, ?, ?, ?, 'submitted', NOW())
      ON DUPLICATE KEY UPDATE
        submission_text = VALUES(submission_text),
        submission_url = VALUES(submission_url),
        status = 'submitted',
        submitted_at = NOW(),
        updated_at = NOW()
      `,
      [assignmentId, userId, submission_text || null, submission_url || null]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM assignment_submissions
      WHERE assignment_id = ? AND user_id = ?
      LIMIT 1
      `,
      [assignmentId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting assignment',
    });
  }
};
