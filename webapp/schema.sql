-- Online Lecture Learning Platform Database Schema
-- Author: Generated for Production Use
-- Date: 2026-02-11

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS lecture_progress;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS lectures;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(512),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Topics table
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_topics_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lectures table
CREATE TABLE lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    topic_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(512),
    duration INT DEFAULT 0 COMMENT 'Duration in seconds',
    order_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    INDEX idx_course_id (course_id),
    INDEX idx_topic_id (topic_id),
    INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments table
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Progress percentage 0-100',
    completed_lessons INT DEFAULT 0,
    total_lessons INT DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lecture Progress table (track individual lecture completion)
CREATE TABLE lecture_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lecture_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    watched_seconds INT DEFAULT 0,
    last_position INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lecture_progress (user_id, lecture_id),
    INDEX idx_user_id (user_id),
    INDEX idx_lecture_id (lecture_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments table
CREATE TABLE assignments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment submissions table
CREATE TABLE assignment_submissions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
