# 📡 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require JWT token in:
- Cookie: `token`
- OR Header: `Authorization: Bearer <token>`

---

## 🔐 Auth Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"  // optional, defaults to "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "created_at": "2026-02-11T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 📚 Course Endpoints

### Get All Courses
```http
GET /api/courses
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "title": "Complete Web Development Bootcamp",
      "description": "Learn HTML, CSS, JavaScript...",
      "thumbnail": "https://...",
      "instructor_name": "Admin User",
      "lecture_count": 8,
      "enrollment_count": 3,
      "created_at": "2026-02-11T..."
    }
  ]
}
```

### Get Single Course
```http
GET /api/courses/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete Web Development Bootcamp",
    "description": "...",
    "thumbnail": "...",
    "instructor_name": "Admin User",
    "instructor_email": "admin@example.com",
    "lectures": [
      {
        "id": 1,
        "course_id": 1,
        "title": "Introduction to Web Development",
        "video_url": "https://...",
        "duration": 600,
        "order_number": 1
      }
    ]
  }
}
```

### Create Course (Admin Only)
```http
POST /api/courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Course Title",
  "description": "Course description",
  "thumbnail": "https://example.com/image.jpg"
}
```

### Update Course (Admin Only)
```http
PUT /api/courses/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnail": "https://..."
}
```

### Delete Course (Admin Only)
```http
DELETE /api/courses/:id
Authorization: Bearer <admin_token>
```

### Enroll in Course
```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

---

## 🎥 Lecture Endpoints

### Get Course Lectures
```http
GET /api/lectures/:courseId
```

### Create Lecture (Admin Only)
```http
POST /api/lectures
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "course_id": 1,
  "title": "Lecture Title",
  "video_url": "https://example.com/video.mp4",
  "duration": 1200,
  "order_number": 1
}
```

### Update Lecture (Admin Only)
```http
PUT /api/lectures/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "video_url": "https://...",
  "duration": 1500,
  "order_number": 1
}
```

### Delete Lecture (Admin Only)
```http
DELETE /api/lectures/:id
Authorization: Bearer <admin_token>
```

### Mark Lecture Complete
```http
POST /api/lectures/:id/complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lecture marked as completed",
  "data": {
    "completed": 3,
    "total": 8,
    "progress": "37.50"
  }
}
```

---

## 📊 Dashboard Endpoints

### Get Student Dashboard
```http
GET /api/dashboard/student
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEnrolled": 2,
      "totalLessons": 14,
      "completedLessons": 6,
      "overallProgress": "42.86"
    },
    "enrolledCourses": [...],
    "recentCourses": [...]
  }
}
```

### Get Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 4,
      "totalCourses": 5,
      "totalEnrollments": 6,
      "totalStudents": 3,
      "revenue": "299.94"
    },
    "recentCourses": [...]
  }
}
```

### Get Course Progress
```http
GET /api/dashboard/course/:courseId/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": 1,
      "user_id": 2,
      "course_id": 1,
      "progress": "37.50",
      "completed_lessons": 3,
      "total_lessons": 8
    },
    "lectures": [
      {
        "id": 1,
        "title": "Introduction",
        "completed": true,
        "completed_at": "2026-02-11T..."
      }
    ]
  }
}
```

---

## 🩺 Health Check

### Check API Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-11T15:30:00.000Z"
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing with cURL

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Get Courses
```bash
curl http://localhost:5000/api/courses
```

### Test Protected Endpoint
```bash
TOKEN="your_jwt_token_here"

curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notes

1. All dates are in ISO 8601 format
2. JWT tokens expire after 7 days (configurable)
3. Passwords are hashed with bcrypt (salt rounds: 10)
4. Cookies are httpOnly and secure in production
5. CORS is enabled for the frontend URL

---

**For detailed implementation, see `/backend/src/` directory**
