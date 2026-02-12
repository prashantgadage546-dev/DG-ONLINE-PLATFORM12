# 🎓 LearnHub - Online Lecture Learning Platform

A full-stack online learning platform similar to Udemy and Apna College, built with modern web technologies and a stunning navy blue design.

## ✨ Features

### Student Features
- ✅ User Authentication (Register/Login)
- ✅ Personal Dashboard with Progress Tracking
- ✅ Course Enrollment & Management
- ✅ **Professional Video Player** with Advanced Controls
  - Play/Pause, Seek, Volume Control
  - Fullscreen Mode
  - 10-second Skip Forward/Backward
  - Playback Speed Control (0.5x - 2x)
  - Real-time Progress Bar
- ✅ **Course Detail Page** with Video Player Integration
- ✅ Lecture List with Progress Tracking
- ✅ Mark Lectures as Complete
- ✅ Next/Previous Lecture Navigation
- ✅ Progress Tracking (Completed/Total Lessons)
- ✅ Overall Progress Percentage
- ✅ Continue Watching Section
- ✅ Recent Activity

### Admin Features
- ✅ Admin Dashboard with Analytics
- ✅ Course Management (Create/Edit/Delete)
- ✅ Lecture Management (Add/Edit/Delete)
- ✅ User Statistics
- ✅ Revenue Tracking (Demo)
- ✅ Enrollment Analytics

### UI/UX Features
- ✅ **Stunning Navy Blue Theme** with Gradient Backgrounds
- ✅ **Glass Morphism Design** with Backdrop Blur
- ✅ Fully Responsive (Mobile/Tablet/Desktop)
- ✅ Modern Professional Design
- ✅ Sidebar Navigation (Collapsible on Mobile)
- ✅ Consistent Design System
- ✅ Smooth Transitions & Animations
- ✅ Custom Scrollbars
- ✅ Progress Bars with Gradient
- ✅ Hover States & Interactive Elements
- ✅ Stats Cards with Icons

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **Zustand** (State Management)
- **Axios** (API Client)

### Backend
- **Node.js**
- **Express.js**
- **MySQL** (Database)
- **JWT** (Authentication)
- **bcryptjs** (Password Hashing)

## 📁 Project Structure

```
webapp/
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   └── courses/page.tsx
│   │   ├── courses/
│   │   │   └── [id]/page.tsx (Course Detail with Video Player)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── CourseCard.tsx
│   │   ├── StatsCard.tsx
│   │   └── VideoPlayer.tsx (Professional Video Player)
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   └── store/
│       └── useAuthStore.ts
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── lectureController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── lectures.js
│   │   │   └── dashboard.js
│   │   ├── app.js
│   │   └── server.js
│   └── ecosystem.config.cjs
├── schema.sql
└── seed.sql
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE lecture_platform;

# Use the database
USE lecture_platform;

# Run schema
source /path/to/webapp/schema.sql

# Run seed data
source /path/to/webapp/seed.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd webapp/backend

# Install dependencies (already installed)
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your database credentials
nano .env

# Set the following variables:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=lecture_platform
# JWT_SECRET=your_super_secret_key
# PORT=5000
# FRONTEND_URL=http://localhost:3000

# Start backend with PM2
pm2 start ecosystem.config.cjs

# Check logs
pm2 logs backend-api --nostream

# Backend will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd webapp/frontend

# Install dependencies (already installed)
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local file
nano .env.local

# Set the following:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

## 🔐 Demo Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Student Accounts
- **Email:** john@example.com | **Password:** admin123
- **Email:** jane@example.com | **Password:** admin123
- **Email:** mike@example.com | **Password:** admin123

## 📊 Database Schema

### Tables
1. **users** - User accounts (admin/student)
2. **courses** - Course information
3. **lectures** - Lecture details for each course
4. **enrollments** - Student course enrollments with progress
5. **lecture_progress** - Individual lecture completion tracking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll in course

### Lectures
- `GET /api/lectures/:courseId` - Get course lectures
- `POST /api/lectures` - Create lecture (Admin)
- `PUT /api/lectures/:id` - Update lecture (Admin)
- `DELETE /api/lectures/:id` - Delete lecture (Admin)
- `POST /api/lectures/:id/complete` - Mark lecture complete

### Dashboard
- `GET /api/dashboard/student` - Get student dashboard data
- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/dashboard/course/:courseId/progress` - Get course progress

## 🎨 Design System

### Navy Blue Theme
- **Primary Navy:** #001127 (Dark Navy)
- **Navy Mid:** #001a3d (Mid Navy)
- **Navy Light:** #00224e (Light Navy)
- **Accent Blue:** #3b82f6 (Bright Blue)
- **Accent Dark:** #2563eb (Dark Blue)
- **White:** #ffffff
- **Glass Effect:** backdrop-blur with rgba white overlays

### Design Features
- **Glass Morphism:** Cards with backdrop-blur-xl and border overlays
- **Gradient Backgrounds:** Navy blue gradients (from-[#001127] via-[#001a3d] to-[#00224e])
- **Smooth Transitions:** transition-all duration-300
- **Custom Scrollbars:** Styled webkit scrollbars with navy theme
- **Hover Effects:** Scale transforms and color transitions

### Spacing
- Consistent padding: `p-6`
- Consistent gaps: `gap-6`
- Rounded corners: `rounded-xl`

### Responsive Breakpoints
- Mobile: < 768px (Sidebar collapses to drawer)
- Tablet: 768px - 1024px (Narrow sidebar)
- Desktop: > 1024px (Full sidebar)

## 📱 Responsive Behavior

### Mobile (< 768px)
- Hamburger menu for sidebar
- Stacked cards (single column)
- Horizontal scrolling tables
- Hidden sidebar by default

### Tablet (768px - 1024px)
- Narrow sidebar
- 2-column grid for cards
- Compact navigation

### Desktop (> 1024px)
- Full sidebar (250px)
- 3-column grid for cards
- Expanded navigation

## 🧪 Testing the Application

1. **Register a new student account** at `/auth/register`
2. **Login** at `/auth/login`
3. **View dashboard** - See stats and enrolled courses
4. **Browse courses** - View available courses on landing page
5. **Click on a course** - Navigate to course detail page
6. **Watch video lectures** - Use the professional video player
   - Play/pause with spacebar
   - Seek with arrow keys
   - Adjust volume
   - Toggle fullscreen
   - Change playback speed
7. **Mark lectures complete** - Track your progress
8. **Navigate between lectures** - Use Next/Previous buttons
9. **Test admin features** - Login as admin and manage courses
10. **Create new courses** - Add courses with lectures and video URLs

## 🔄 Development Workflow

```bash
# Backend (Terminal 1)
cd backend
pm2 start ecosystem.config.cjs
pm2 logs backend-api

# Frontend (Terminal 2)
cd frontend
npm run dev

# Visit http://localhost:3000
```

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm run start
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `systemctl status mysql`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
fuser -k 5000/tcp

# Kill process on port 3000 (frontend)
fuser -k 3000/tcp
```

### PM2 Issues
```bash
# Restart backend
pm2 restart backend-api

# Delete all PM2 processes
pm2 delete all

# View logs
pm2 logs --nostream
```

## 📝 License

MIT License - Feel free to use for personal and commercial projects.

## 👥 Credits

Developed as a full-stack learning platform demonstration.

## 🆘 Support

For issues and questions, refer to the documentation or create an issue in the repository.

---

**Built with ❤️ using Next.js, Express.js, and MySQL**
