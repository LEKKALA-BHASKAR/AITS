# AITS Centralized Student Management System (CSMS) - API Documentation

## Base URL
```
http://localhost:8001/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 attempts per 15 minutes
- File uploads: 20 uploads per hour

---

## Authentication Routes (`/api/auth`)

### POST /login
Login to the system
- **Body**: `{ email, password, role }`
- **Role**: "student", "teacher", or "admin"
- **Response**: `{ token, user: { id, name, email, role, imageURL } }`
- **Rate Limited**: 5 attempts per 15 minutes
- **Features**: 
  - Tracks login attempts
  - Auto-locks account after 5 failed attempts
  - Updates lastLogin timestamp

### POST /register
Register a new user (requires admin approval)
- **Body**: `{ name, email, password, role, ...otherData }`
- **Response**: `{ message, userId }`

### POST /change-password
Change own password (authenticated)
- **Auth**: Required
- **Body**: `{ currentPassword, newPassword }`
- **Response**: `{ message }`

### POST /reset-password
Reset another user's password (admin only)
- **Auth**: Required (admin)
- **Body**: `{ userId, role, newPassword }`
- **Response**: `{ message }`

### GET /login-history
Get own login history
- **Auth**: Required
- **Response**: Array of login logs (last 50)

---

## Student Routes (`/api/student`)

### GET /profile
Get own profile
- **Auth**: Required (student)
- **Response**: Student object with populated department and section

### PUT /profile
Update own profile (limited fields)
- **Auth**: Required (student)
- **Body**: `{ phone, guardianName, guardianPhone }`
- **Response**: Updated student object

### POST /upload-image
Upload profile image
- **Auth**: Required (student)
- **Body**: FormData with 'image' file
- **File Types**: JPEG, PNG (max 5MB)
- **Response**: `{ message, imageURL }`
- **Rate Limited**: 20 uploads per hour

### GET /attendance
Get own attendance records
- **Auth**: Required (student)
- **Response**: Array of attendance records

### GET /attendance/stats
Get attendance statistics
- **Auth**: Required (student)
- **Response**: 
```json
{
  "totalClasses": 100,
  "presentCount": 85,
  "absentCount": 10,
  "lateCount": 5,
  "attendancePercentage": "85.00",
  "lowAttendanceWarning": false
}
```

### GET /results
Get exam results and backlog count
- **Auth**: Required (student)
- **Response**: `{ results: [], backlogCount: 0 }`

### GET /achievements
Get achievements and certificates
- **Auth**: Required (student)
- **Response**: `{ achievements: [], certificates: [] }`

### GET /remarks
Get teacher/admin remarks
- **Auth**: Required (student)
- **Response**: Array of remarks with teacher info

### GET /notifications
Get notifications
- **Auth**: Required (student)
- **Response**: Array of notifications (last 50)

---

## Teacher Routes (`/api/teacher`)

### GET /profile
Get own profile
- **Auth**: Required (teacher)
- **Response**: Teacher object with populated department and sections

### POST /upload-image
Upload profile image
- **Auth**: Required (teacher)
- **Body**: FormData with 'image' file
- **Response**: `{ message, imageURL }`

### GET /sections
Get assigned sections with students
- **Auth**: Required (teacher)
- **Response**: Array of sections

### GET /students/:sectionId
Get students in a section
- **Auth**: Required (teacher)
- **Response**: Array of students

### POST /student/attendance
Mark attendance for a student
- **Auth**: Required (teacher)
- **Body**: `{ studentId, subject, status }`
- **Status**: "present", "absent", or "late"
- **Response**: `{ message }`

### POST /attendance/bulk
Mark attendance for multiple students
- **Auth**: Required (teacher)
- **Body**: `{ attendanceData: [{ studentId, subject, status }] }`
- **Response**: `{ message, results }`

### POST /student/result
Add result/marks for a student
- **Auth**: Required (teacher)
- **Body**: `{ studentId, semester, subject, marks, grade, examType }`
- **Response**: `{ message }`

### PUT /student/result/:resultId
Update existing result
- **Auth**: Required (teacher)
- **Body**: `{ studentId, marks, grade }`
- **Response**: `{ message, result }`

### POST /student/remark
Add remark for a student
- **Auth**: Required (teacher)
- **Body**: `{ studentId, remark, type }`
- **Type**: "positive", "negative", or "neutral"
- **Response**: `{ message }`

### GET /section/:sectionId/stats
Get section statistics
- **Auth**: Required (teacher)
- **Response**: 
```json
{
  "totalStudents": 50,
  "atRiskStudents": 5,
  "studentsWithBacklogs": 10,
  "avgAttendance": "82.50"
}
```

---

## Admin Routes (`/api/admin`)

### Dashboard & Analytics

#### GET /dashboard
Get dashboard overview
- **Auth**: Required (admin)
- **Response**: 
```json
{
  "totalStudents": 500,
  "totalTeachers": 50,
  "totalDepartments": 5,
  "atRiskStudents": 25
}
```

#### GET /analytics
Get comprehensive analytics
- **Auth**: Required (admin)
- **Response**: 
```json
{
  "departmentStats": [],
  "riskStats": [],
  "lowAttendanceStudents": 30,
  "backlogStats": {},
  "topStudents": [],
  "loginActivity": []
}
```

#### GET /login-logs
Get login logs
- **Auth**: Required (admin)
- **Query**: `?role=student&status=failed&limit=100`
- **Response**: Array of login logs

### Student Management

#### GET /students
Get all active students
- **Auth**: Required (admin)
- **Response**: Array of students with populated refs

#### GET /students/search
Search/filter students
- **Auth**: Required (admin)
- **Query**: `?name=John&departmentId=xxx&sectionId=yyy&atRisk=true&isApproved=false`
- **Response**: Filtered students array

#### GET /students/:id
Get single student with full details
- **Auth**: Required (admin)
- **Response**: Student object with all details

#### POST /students
Create new student
- **Auth**: Required (admin)
- **Body**: Student data including password
- **Response**: `{ message, studentId }`

#### PUT /students/:id
Update student
- **Auth**: Required (admin)
- **Body**: Fields to update
- **Response**: Updated student object

#### POST /students/:id/upload-image
Upload student profile image
- **Auth**: Required (admin)
- **Body**: FormData with 'image' file
- **Response**: `{ message, imageURL }`

#### POST /students/:id/attendance
Add attendance record
- **Auth**: Required (admin)
- **Body**: `{ subject, date, status }`
- **Response**: `{ message }`

#### POST /students/:id/results
Add result record
- **Auth**: Required (admin)
- **Body**: `{ semester, subject, marks, grade, examType }`
- **Response**: `{ message }`

#### PUT /students/:id/promote
Move student to different section/department
- **Auth**: Required (admin)
- **Body**: `{ departmentId, sectionId }`
- **Response**: `{ message, student }`

#### DELETE /students/:id
Deactivate student (soft delete)
- **Auth**: Required (admin)
- **Response**: `{ message }`

#### DELETE /students/:id/permanent
Permanently delete student
- **Auth**: Required (admin)
- **Response**: `{ message }`

#### GET /students/export
Export all students as CSV
- **Auth**: Required (admin)
- **Response**: CSV file download

#### PUT /students/update-risk-status
Auto-update at-risk status for all students
- **Auth**: Required (admin)
- **Logic**: Marks students at risk if backlogCount > 2 or avgMarks < 40
- **Response**: `{ message }`

### Teacher Management

#### GET /teachers
Get all active teachers
- **Auth**: Required (admin)
- **Response**: Array of teachers

#### POST /teachers
Create new teacher
- **Auth**: Required (admin)
- **Body**: Teacher data including password
- **Response**: `{ message, teacherId }`

#### POST /teachers/:id/upload-image
Upload teacher profile image
- **Auth**: Required (admin)
- **Body**: FormData with 'image' file
- **Response**: `{ message, imageURL }`

### User Approvals

#### GET /pending-approvals
Get all pending user approvals
- **Auth**: Required (admin)
- **Response**: 
```json
{
  "students": [],
  "teachers": [],
  "admins": []
}
```

#### PUT /approve-user/:role/:id
Approve or reject a user
- **Auth**: Required (admin)
- **Params**: role (student/teacher/admin), id
- **Body**: `{ isApproved: true/false }`
- **Response**: `{ message }`

#### PUT /approve-all/:role
Bulk approve all pending users of a role
- **Auth**: Required (admin)
- **Params**: role (student/teacher/admin)
- **Response**: `{ message }`

### Notifications

#### POST /notifications
Create notification/announcement
- **Auth**: Required (admin)
- **Body**: 
```json
{
  "title": "Important Announcement",
  "message": "Message content",
  "target": "all|student|teacher|section|department",
  "targetId": "optional_id_for_specific_target"
}
```
- **Response**: `{ message }`

---

## Certificate Routes (`/api/certificates`)

### POST /upload
Upload certificate for approval (student)
- **Auth**: Required (student)
- **Body**: FormData with 'certificate' file + `{ title, description, category }`
- **Category**: "academic", "sports", "cultural", "technical", "other"
- **Response**: `{ message, certificate }`
- **Rate Limited**: 20 uploads per hour

### GET /my-certificates
Get own certificates (student)
- **Auth**: Required (student)
- **Response**: Array of certificates with review status

### GET /pending
Get pending certificates for review (teacher/admin)
- **Auth**: Required (teacher/admin)
- **Response**: Array of pending certificates
- **Note**: Teachers only see certificates from their assigned sections

### PUT /:id/review
Approve or reject certificate (teacher/admin)
- **Auth**: Required (teacher/admin)
- **Body**: `{ status: "approved|rejected", reviewComments: "..." }`
- **Response**: `{ message, certificate }`
- **Effect**: Approved certificates are added to student achievements

### GET /all
Get all certificates (admin)
- **Auth**: Required (admin)
- **Query**: `?status=pending&category=academic`
- **Response**: Array of certificates

### DELETE /:id
Delete own pending certificate (student)
- **Auth**: Required (student)
- **Response**: `{ message }`
- **Note**: Only pending certificates can be deleted

---

## Support Ticket Routes (`/api/support-tickets`)

### POST /
Create support ticket (student)
- **Auth**: Required (student)
- **Body**: `{ subject, description, category, priority }`
- **Category**: "attendance", "marks", "profile", "technical", "other"
- **Priority**: "low", "medium", "high", "urgent"
- **Response**: `{ message, ticket }`

### GET /my-tickets
Get own tickets (student)
- **Auth**: Required (student)
- **Query**: `?status=open`
- **Response**: Array of tickets

### GET /:id
Get single ticket details
- **Auth**: Required (student/teacher/admin)
- **Response**: Ticket with full details
- **Note**: Students can only view their own tickets

### GET /
Get all/filtered tickets (admin/teacher)
- **Auth**: Required (admin/teacher)
- **Query**: `?status=open&category=marks&priority=high&assignedToMe=true`
- **Response**: Array of tickets

### PUT /:id/assign
Assign ticket to admin (admin only)
- **Auth**: Required (admin)
- **Body**: `{ assignedTo: adminId }`
- **Response**: `{ message, ticket }`

### POST /:id/response
Add response to ticket (admin/teacher)
- **Auth**: Required (admin/teacher)
- **Body**: `{ message: "Response text" }`
- **Response**: `{ message, ticket }`

### PUT /:id/status
Update ticket status (admin/teacher)
- **Auth**: Required (admin/teacher)
- **Body**: `{ status: "open|in_progress|resolved|closed" }`
- **Response**: `{ message, ticket }`

### GET /stats/overview
Get ticket statistics (admin)
- **Auth**: Required (admin)
- **Response**: 
```json
{
  "total": 100,
  "byStatus": { "open": 20, "inProgress": 30, "resolved": 40, "closed": 10 },
  "byCategory": [],
  "byPriority": []
}
```

---

## Department Routes (`/api/department`)

### GET /
Get all departments
- **Auth**: Required
- **Response**: Array of departments

### POST /
Create department
- **Auth**: Required (admin)
- **Body**: `{ name, code, hodId }`
- **Response**: `{ message, departmentId }`

### PUT /:id
Update department
- **Auth**: Required (admin)
- **Body**: Fields to update
- **Response**: `{ message, department }`

### DELETE /:id
Deactivate department
- **Auth**: Required (admin)
- **Response**: `{ message }`

---

## Section Routes (`/api/section`)

### GET /
Get all sections
- **Auth**: Required
- **Response**: Array of sections

### POST /
Create section
- **Auth**: Required (admin)
- **Body**: `{ name, departmentId, teacherId }`
- **Response**: `{ message, sectionId }`

### PUT /:id
Update section
- **Auth**: Required (admin)
- **Body**: Fields to update
- **Response**: `{ message, section }`

### DELETE /:id
Deactivate section
- **Auth**: Required (admin)
- **Response**: `{ message }`

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{ "error": "Validation error message" }
```

### 401 Unauthorized
```json
{ "error": "No authentication token" }
{ "error": "Invalid token" }
{ "error": "Invalid credentials" }
```

### 403 Forbidden
```json
{ "error": "Access denied" }
{ "error": "Your account is pending admin approval" }
```

### 404 Not Found
```json
{ "error": "Resource not found" }
```

### 429 Too Many Requests
```json
{ "error": "Too many requests from this IP, please try again later." }
{ "error": "Account temporarily locked due to multiple failed login attempts." }
```

### 500 Internal Server Error
```json
{ "error": "Error message" }
```

---

## Data Models

### Student
```javascript
{
  name: String,
  rollNumber: String (unique),
  email: String (unique),
  password: String (hashed),
  departmentId: ObjectId,
  sectionId: ObjectId,
  imageURL: String,
  cloudinaryPublicId: String,
  phone: String,
  guardianName: String,
  guardianPhone: String,
  attendance: [{ subject, date, status }],
  results: [{ semester, subject, marks, grade, examType }],
  remarks: [{ teacherId, remark, type, date }],
  achievements: [{ title, description, certificateURL, date }],
  certificates: [{ title, url, uploadDate }],
  backlogCount: Number,
  atRisk: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  isApproved: Boolean,
  createdAt: Date
}
```

### Teacher
```javascript
{
  name: String,
  teacherId: String (unique),
  email: String (unique),
  password: String (hashed),
  departmentId: ObjectId,
  imageURL: String,
  cloudinaryPublicId: String,
  subjects: [String],
  assignedSections: [ObjectId],
  experience: Number,
  designation: String,
  phone: String,
  lastLogin: Date,
  isActive: Boolean,
  isApproved: Boolean,
  createdAt: Date
}
```

### Admin
```javascript
{
  name: String,
  adminId: String (unique),
  email: String (unique),
  password: String (hashed),
  departmentAccess: [ObjectId],
  role: String (super_admin|department_admin),
  imageURL: String,
  cloudinaryPublicId: String,
  lastLogin: Date,
  isActive: Boolean,
  isApproved: Boolean,
  createdAt: Date
}
```

---

## Security Features

1. **Rate Limiting**: Different limits for different route types
2. **Helmet**: Secure HTTP headers
3. **Sanitization**: Protection against NoSQL injection and XSS
4. **JWT Authentication**: Secure token-based auth with 7-day expiry
5. **Password Hashing**: bcrypt with salt rounds
6. **Login Tracking**: All login attempts are logged
7. **Account Locking**: Auto-lock after 5 failed login attempts
8. **Role-Based Access Control**: Strict route protection by role
9. **File Upload Validation**: Type and size restrictions
10. **CORS Configuration**: Configurable origin restrictions

---

## Environment Variables

Required environment variables (see `.env.example`):
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `PORT`: Server port (default: 8001)
- `CORS_ORIGINS`: Allowed CORS origins
- `JWT_SECRET`: Secret key for JWT signing
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
