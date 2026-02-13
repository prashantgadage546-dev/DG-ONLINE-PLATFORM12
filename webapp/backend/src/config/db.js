const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lecture_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const columnExists = async (tableName, columnName) => {
  const [rows] = await pool.query(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    LIMIT 1
    `,
    [tableName, columnName]
  );
  return rows.length > 0;
};

const indexExists = async (tableName, indexName) => {
  const [rows] = await pool.query(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND INDEX_NAME = ?
    LIMIT 1
    `,
    [tableName, indexName]
  );
  return rows.length > 0;
};

const foreignKeyExists = async (tableName, constraintName) => {
  const [rows] = await pool.query(
    `
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND CONSTRAINT_NAME = ?
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    LIMIT 1
    `,
    [tableName, constraintName]
  );
  return rows.length > 0;
};

const ensureDatabaseStructure = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      INDEX idx_topics_course_id (course_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('lectures', 'topic_id'))) {
    await pool.query('ALTER TABLE lectures ADD COLUMN topic_id INT NULL');
  }

  if (!(await columnExists('lectures', 'description'))) {
    await pool.query('ALTER TABLE lectures ADD COLUMN description TEXT NULL');
  }

  if (!(await indexExists('lectures', 'idx_lectures_topic_id'))) {
    await pool.query('CREATE INDEX idx_lectures_topic_id ON lectures(topic_id)');
  }

  if (!(await foreignKeyExists('lectures', 'fk_lectures_topic_id'))) {
    await pool.query(
      'ALTER TABLE lectures ADD CONSTRAINT fk_lectures_topic_id FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL'
    );
  }

  if (!(await columnExists('lecture_progress', 'watched_seconds'))) {
    await pool.query('ALTER TABLE lecture_progress ADD COLUMN watched_seconds INT DEFAULT 0');
  }

  if (!(await columnExists('lecture_progress', 'last_position'))) {
    await pool.query('ALTER TABLE lecture_progress ADD COLUMN last_position INT DEFAULT 0');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      due_date DATETIME NULL,
      max_score INT DEFAULT 100,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_assignments_topic_id (topic_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      assignment_id INT NOT NULL,
      user_id INT NOT NULL,
      submission_text TEXT NULL,
      submission_url VARCHAR(512) NULL,
      status ENUM('submitted', 'reviewed') DEFAULT 'submitted',
      score INT NULL,
      feedback TEXT NULL,
      submitted_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_assignment_user (assignment_id, user_id),
      INDEX idx_submissions_user_id (user_id),
      INDEX idx_submissions_assignment_id (assignment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

module.exports = { pool, testConnection, ensureDatabaseStructure };
