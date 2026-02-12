-- Seed Data for Online Lecture Learning Platform
-- This file contains dummy data for testing

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$YQZj.3jN5X9h8kJxN8K6LOEQyTX2J0pGmV0vKxMxYX8XqZ0KxMxYu', 'admin'),
('John Doe', 'john@example.com', '$2b$10$YQZj.3jN5X9h8kJxN8K6LOEQyTX2J0pGmV0vKxMxYX8XqZ0KxMxYu', 'student'),
('Jane Smith', 'jane@example.com', '$2b$10$YQZj.3jN5X9h8kJxN8K6LOEQyTX2J0pGmV0vKxMxYX8XqZ0KxMxYu', 'student'),
('Mike Johnson', 'mike@example.com', '$2b$10$YQZj.3jN5X9h8kJxN8K6LOEQyTX2J0pGmV0vKxMxYX8XqZ0KxMxYu', 'student');

-- Insert courses
INSERT INTO courses (title, description, thumbnail, created_by) VALUES 
('Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, React, Node.js and become a full-stack developer', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 1),
('Python Programming Masterclass', 'Master Python from basics to advanced including Django and Flask', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800', 1),
('Data Science with Python', 'Complete guide to Data Science, Machine Learning and AI with Python', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 1),
('React Native Mobile Development', 'Build cross-platform mobile apps with React Native', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 1),
('Digital Marketing Complete Course', 'Learn SEO, Social Media Marketing, Email Marketing and Google Ads', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 1);

-- Insert lectures for Course 1 (Web Development)
INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES 
(1, 'Introduction to Web Development', 'https://example.com/video1.mp4', 600, 1),
(1, 'HTML Fundamentals', 'https://example.com/video2.mp4', 900, 2),
(1, 'CSS Basics and Styling', 'https://example.com/video3.mp4', 1200, 3),
(1, 'JavaScript Introduction', 'https://example.com/video4.mp4', 1500, 4),
(1, 'DOM Manipulation', 'https://example.com/video5.mp4', 1800, 5),
(1, 'React Basics', 'https://example.com/video6.mp4', 2100, 6),
(1, 'Node.js and Express', 'https://example.com/video7.mp4', 2400, 7),
(1, 'Building Full Stack Apps', 'https://example.com/video8.mp4', 2700, 8);

-- Insert lectures for Course 2 (Python)
INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES 
(2, 'Python Installation and Setup', 'https://example.com/video9.mp4', 300, 1),
(2, 'Variables and Data Types', 'https://example.com/video10.mp4', 600, 2),
(2, 'Control Flow and Loops', 'https://example.com/video11.mp4', 900, 3),
(2, 'Functions and Modules', 'https://example.com/video12.mp4', 1200, 4),
(2, 'Object Oriented Programming', 'https://example.com/video13.mp4', 1500, 5),
(2, 'Django Web Framework', 'https://example.com/video14.mp4', 1800, 6);

-- Insert lectures for Course 3 (Data Science)
INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES 
(3, 'Data Science Introduction', 'https://example.com/video15.mp4', 450, 1),
(3, 'NumPy and Pandas', 'https://example.com/video16.mp4', 900, 2),
(3, 'Data Visualization with Matplotlib', 'https://example.com/video17.mp4', 1200, 3),
(3, 'Machine Learning Basics', 'https://example.com/video18.mp4', 1500, 4),
(3, 'Deep Learning with TensorFlow', 'https://example.com/video19.mp4', 1800, 5);

-- Insert lectures for Course 4 (React Native)
INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES 
(4, 'React Native Setup', 'https://example.com/video20.mp4', 600, 1),
(4, 'Building Your First App', 'https://example.com/video21.mp4', 900, 2),
(4, 'Navigation and Routing', 'https://example.com/video22.mp4', 1200, 3),
(4, 'State Management', 'https://example.com/video23.mp4', 1500, 4);

-- Insert lectures for Course 5 (Digital Marketing)
INSERT INTO lectures (course_id, title, video_url, duration, order_number) VALUES 
(5, 'Digital Marketing Overview', 'https://example.com/video24.mp4', 300, 1),
(5, 'SEO Fundamentals', 'https://example.com/video25.mp4', 900, 2),
(5, 'Social Media Strategy', 'https://example.com/video26.mp4', 1200, 3),
(5, 'Google Ads Mastery', 'https://example.com/video27.mp4', 1500, 4);

-- Insert enrollments
INSERT INTO enrollments (user_id, course_id, progress, completed_lessons, total_lessons) VALUES 
(2, 1, 37.50, 3, 8),
(2, 2, 50.00, 3, 6),
(3, 1, 12.50, 1, 8),
(3, 3, 60.00, 3, 5),
(4, 1, 75.00, 6, 8),
(4, 4, 25.00, 1, 4);

-- Insert lecture progress
INSERT INTO lecture_progress (user_id, lecture_id, completed, completed_at) VALUES 
-- User 2 (John) progress
(2, 1, TRUE, NOW()),
(2, 2, TRUE, NOW()),
(2, 3, TRUE, NOW()),
(2, 9, TRUE, NOW()),
(2, 10, TRUE, NOW()),
(2, 11, TRUE, NOW()),
-- User 3 (Jane) progress
(3, 1, TRUE, NOW()),
(3, 15, TRUE, NOW()),
(3, 16, TRUE, NOW()),
(3, 17, TRUE, NOW()),
-- User 4 (Mike) progress
(4, 1, TRUE, NOW()),
(4, 2, TRUE, NOW()),
(4, 3, TRUE, NOW()),
(4, 4, TRUE, NOW()),
(4, 5, TRUE, NOW()),
(4, 6, TRUE, NOW()),
(4, 20, TRUE, NOW());
