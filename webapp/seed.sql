-- Seed Data for LearnHub
-- Compatible with the latest schema (topics + lecture progress tracking)

-- Test account password for all users:
-- admin123

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$9.tTA56o7H56AePBdV5z1euhflDudve3NfVWy6YyYWA.jFnyIOnlq', 'admin'),
('John Doe', 'john@example.com', '$2b$10$9.tTA56o7H56AePBdV5z1euhflDudve3NfVWy6YyYWA.jFnyIOnlq', 'student'),
('Jane Smith', 'jane@example.com', '$2b$10$9.tTA56o7H56AePBdV5z1euhflDudve3NfVWy6YyYWA.jFnyIOnlq', 'student'),
('Mike Johnson', 'mike@example.com', '$2b$10$9.tTA56o7H56AePBdV5z1euhflDudve3NfVWy6YyYWA.jFnyIOnlq', 'student'),
('Emma Brown', 'emma@example.com', '$2b$10$9.tTA56o7H56AePBdV5z1euhflDudve3NfVWy6YyYWA.jFnyIOnlq', 'student');

INSERT INTO courses (title, description, thumbnail, created_by) VALUES
('Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, React, Node.js and become a full-stack developer.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 1),
('Python Programming Masterclass', 'Master Python from basics to advanced with practical exercises.', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800', 1),
('Data Science with Python', 'Data analysis, visualization, and machine learning using Python.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 1),
('React Native Mobile Development', 'Build cross-platform mobile apps with React Native.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 1),
('Digital Marketing Complete Course', 'Learn SEO, social media marketing, and performance campaigns.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 1);

INSERT INTO topics (course_id, name, description) VALUES
-- Course 1 topics
(1, 'Web Basics', 'Foundations of the web platform'),
(1, 'Frontend Development', 'HTML, CSS, and JavaScript UI development'),
(1, 'Backend Development', 'Server-side APIs and persistence'),
-- Course 2 topics
(2, 'Python Fundamentals', 'Syntax, data types, and control flow'),
(2, 'Python Advanced', 'OOP, modules, and real projects'),
-- Course 3 topics
(3, 'Data Analysis', 'Working with datasets and exploration'),
(3, 'Machine Learning', 'Core ML workflows and models'),
-- Course 4 topics
(4, 'React Native Basics', 'Project setup and fundamentals'),
(4, 'App Architecture', 'State management and navigation'),
-- Course 5 topics
(5, 'Marketing Foundations', 'Channels and campaign strategy'),
(5, 'Performance Marketing', 'Optimization and paid campaigns');

-- Public MP4 URLs for testing playback
-- These are intentionally external so no manual upload is needed for testing.
INSERT INTO lectures (course_id, topic_id, title, description, video_url, duration, order_number) VALUES
-- Course 1: Web Development
(1, 1, 'Introduction to Web Development', 'Course overview and developer workflow.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 596, 1),
(1, 1, 'How the Internet Works', 'HTTP, DNS, browsers, and servers.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 653, 2),
(1, 2, 'HTML Fundamentals', 'Semantic tags and document structure.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 180, 3),
(1, 2, 'CSS Layout Basics', 'Flexbox and grid essentials.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 210, 4),
(1, 2, 'JavaScript DOM Manipulation', 'Querying, events, and state updates.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 220, 5),
(1, 3, 'Node.js + Express API', 'Building and testing REST endpoints.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 240, 6),

-- Course 2: Python
(2, 4, 'Python Setup and Tooling', 'Environment setup and package management.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 280, 1),
(2, 4, 'Variables and Control Flow', 'Core syntax and branching.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 888, 2),
(2, 4, 'Functions and Modules', 'Code reuse and project structure.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 186, 3),
(2, 5, 'Object-Oriented Python', 'Classes, inheritance, and composition.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 734, 4),
(2, 5, 'Python Project Walkthrough', 'Putting Python concepts together.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 238, 5),

-- Course 3: Data Science
(3, 6, 'NumPy and Pandas Essentials', 'Dataframes and vectorized operations.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 208, 1),
(3, 6, 'Data Cleaning Pipeline', 'Missing values, outliers, and transforms.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 167, 2),
(3, 7, 'Machine Learning Basics', 'Training, validation, and metrics.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 596, 3),
(3, 7, 'Model Evaluation', 'Precision, recall, and model comparison.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 653, 4),

-- Course 4: React Native
(4, 8, 'React Native Setup', 'Create first app and understand tooling.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 220, 1),
(4, 8, 'Native Components and Styling', 'Layout, typography, and responsiveness.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 210, 2),
(4, 9, 'Navigation Patterns', 'Stack and tab navigation.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 888, 3),
(4, 9, 'State Management in Mobile Apps', 'Global and local state strategy.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 734, 4),

-- Course 5: Marketing
(5, 10, 'Digital Marketing Overview', 'Channel mix and growth loops.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 180, 1),
(5, 10, 'SEO Fundamentals', 'On-page SEO and technical basics.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 240, 2),
(5, 11, 'Paid Campaign Optimization', 'Audience, bidding, and creative iteration.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 238, 3);

INSERT INTO assignments (topic_id, title, description, due_date, max_score, created_by) VALUES
(1, 'Assignment: Build a Static Landing Page', 'Create a responsive landing page with semantic HTML and basic CSS.', DATE_ADD(NOW(), INTERVAL 7 DAY), 100, 1),
(2, 'Assignment: JavaScript DOM Challenge', 'Build a task manager with add, edit, delete and filter interactions.', DATE_ADD(NOW(), INTERVAL 10 DAY), 100, 1),
(4, 'Assignment: Python CLI Utility', 'Write a Python CLI app for managing personal tasks.', DATE_ADD(NOW(), INTERVAL 6 DAY), 100, 1),
(6, 'Assignment: Data Cleaning Notebook', 'Prepare and clean a messy dataset and document each step.', DATE_ADD(NOW(), INTERVAL 8 DAY), 100, 1),
(10, 'Assignment: SEO Audit Report', 'Audit a website and submit SEO improvement suggestions.', DATE_ADD(NOW(), INTERVAL 9 DAY), 100, 1);

INSERT INTO enrollments (user_id, course_id, progress, completed_lessons, total_lessons) VALUES
(2, 1, 50.00, 3, 6),
(2, 2, 60.00, 3, 5),
(3, 1, 16.67, 1, 6),
(3, 3, 50.00, 2, 4),
(4, 1, 83.33, 5, 6),
(4, 4, 25.00, 1, 4),
(5, 5, 33.33, 1, 3);

INSERT INTO lecture_progress (user_id, lecture_id, completed, watched_seconds, last_position, completed_at) VALUES
-- John
(2, 1, TRUE, 596, 596, NOW()),
(2, 2, TRUE, 653, 653, NOW()),
(2, 3, TRUE, 180, 180, NOW()),
(2, 7, TRUE, 280, 280, NOW()),
(2, 8, TRUE, 888, 888, NOW()),
(2, 9, TRUE, 167, 167, NOW()),

-- Jane
(3, 1, TRUE, 596, 596, NOW()),
(3, 12, TRUE, 208, 208, NOW()),
(3, 13, TRUE, 167, 167, NOW()),

-- Mike
(4, 1, TRUE, 596, 596, NOW()),
(4, 2, TRUE, 653, 653, NOW()),
(4, 3, TRUE, 180, 180, NOW()),
(4, 4, TRUE, 210, 210, NOW()),
(4, 5, TRUE, 220, 220, NOW()),
(4, 16, TRUE, 220, 220, NOW()),

-- Emma
(5, 20, TRUE, 180, 180, NOW());

INSERT INTO assignment_submissions (assignment_id, user_id, submission_text, submission_url, status, score, submitted_at) VALUES
(1, 2, 'Implemented semantic sections, hero, CTA and responsive grid.', 'https://github.com/john-doe/landing-page-assignment', 'reviewed', 88, NOW()),
(3, 2, 'Built a Python CLI with argparse and file persistence.', 'https://github.com/john-doe/python-cli-task', 'submitted', NULL, NOW()),
(4, 3, 'Data cleaning notebook with pandas transformations and visuals.', 'https://drive.google.com/file/d/jane-ds-assignment', 'reviewed', 91, NOW()),
(2, 4, 'Task manager with local storage and filter tabs.', 'https://github.com/mike-j/dom-task-manager', 'submitted', NULL, NOW()),
(5, 5, 'SEO audit with lighthouse screenshots and keyword suggestions.', 'https://docs.google.com/document/d/emma-seo-audit', 'submitted', NULL, NOW());
