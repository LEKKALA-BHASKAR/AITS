# Complete Timetable-Driven Attendance System - Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Cron Jobs](#cron-jobs)
8. [Usage Examples](#usage-examples)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This system implements a **fully dynamic, timetable-driven attendance module** where all attendance functionality strictly depends on the timetable uploaded by the HOD. Everything—subjects, attendance timing, student view, teacher permissions, and monthly attendance reports—revolves around the timetable.

### Key Principles

✅ **No hardcoded subjects** - All subjects dynamically derived from timetable  
✅ **Time-based validation** - Teachers can only mark during their period  
✅ **HOD full control** - Override attendance anytime with audit logging  
✅ **Automated reports** - Monthly Excel reports with color coding  
✅ **Complete transparency** - Full audit trail for all changes  
✅ **Student empowerment** - Correction request workflow  

---

## Features Implemented

### 🎯 Core Features

#### 1. Dynamic Timetable Upload (HOD/Admin)
- Plain text upload (no complex forms)
- Intelligent parsing of schedule
- Auto-detection of subjects, timings, and days
- Auto-assignment of teachers to subjects
- Clash detection and validation
- Format: Simple, readable text

**Example Timetable Format:**
```
CSE-A:
MON: 9-10 DS, 10-11 CO, 11-12 OS, 1-2 DAA, 2-3 FLAT
TUE: 9-10 OS, 10-11 AI, 11-12 DS, 1-2 DAA, 2-3 CO
```

#### 2. Automatic Assignment Detection
- Subjects automatically detected from timetable
- Class timings auto-extracted
- Teacher-subject-section linking
- Warning for missing teacher assignments
- Clash detection for double bookings
- Complete validation before saving

#### 3. Dynamic Subject Visibility (Students)
- Students see only timetable-based subjects
- Real-time "current class" display
- Weekly timetable view
- Next period countdown
- Subject-wise attendance summary
- No manual subject selection

#### 4. Teacher Time-Window Restrictions
- Attendance marking only during period time
- 15-minute grace period (configurable)
- Auto-detection of current subject
- Section and subject locked to timetable
- Countdown timer for marking window
- Automatic blocking outside window

#### 5. HOD Override Capability ⭐
- Mark/edit attendance anytime
- Retroactive attendance entry
- Override with mandatory reason
- Complete audit trail
- Unlock locked attendance
- Emergency corrections

#### 6. Attendance Locking 🔒
- Auto-lock after grace period
- Prevents teacher modifications after lock
- HOD can unlock with reason
- Hourly cron job for auto-locking
- Lock status visible in UI
- Audit log for all locks/unlocks

#### 7. Audit Logging 📝
**Every attendance change tracked:**
- Who made the change
- What was changed (before/after)
- When it was changed
- Why (reason for HOD overrides)
- IP address tracking
- Complete timeline view
- Section-wise audit reports

#### 8. Monthly Excel Reports 📊
**Auto-generated with:**
- Color-coded rows:
  - 🟢 Green: ≥75% attendance
  - 🟡 Yellow: 65-74.99%
  - 🔴 Red: <65%
- Subject-wise sheets
- Student details (roll number, name)
- Total classes & attended
- Percentage calculation
- Status indicators
- Summary statistics
- Proper naming: `CSE-A_Attendance_Report_November_2025.xlsx`

**Generation:**
- Automatic: 1st of month at 2 AM
- Manual: Download anytime via API
- Stored in `/backend/reports/`
- Downloadable for all sections

#### 9. Student Analytics Dashboard 📈
**Comprehensive view with:**
- Overall attendance percentage
- Subject-wise breakdown
- Color-coded warnings
- At-risk badges (<65%, <75%)
- Improvement suggestions
- Classes needed to reach threshold
- Weekly/monthly trends
- Section average comparison
- Recent attendance pattern

**Example Suggestions:**
```
"You are below 75% in OS. Please attend next 3 classes to improve."
"Your attendance in CO is below 65%. HOD has been alerted."
"To reach 75% in DS, attend the next 4 classes without missing."
```

#### 10. Notifications & Alerts 🔔

**Teacher Notifications:**
- Period start reminders
- "Time to take attendance for OS (CSE-A) 9-10 AM"
- Unmarked attendance warnings (after 10 min)

**Student Alerts:**
- Weekly low attendance alerts (Monday 8 AM)
- Critical attendance warnings (<65%)
- Warning badges (65-74%)
- Improvement suggestions

**HOD Alerts:**
- Students below 65% (critical)
- Multiple correction requests
- Audit log summaries

**Schedule:**
- Weekly: Every Monday at 8 AM
- Unmarked check: Every 30 min (8 AM - 6 PM)
- Real-time: Via Socket.IO (when available)

#### 11. Attendance Correction Workflow 🔄

**Student Request:**
- Submit correction request
- Provide reason
- Attach proof (optional)
- Track status (Pending/Approved/Rejected)

**Teacher/HOD Review:**
- View pending requests
- Approve or reject
- Add review comments
- Auto-update attendance on approval
- Audit log entry created

**Benefits:**
- Formal dispute resolution
- Transparent process
- Reduces HOD workload
- Student empowerment

#### 12. Leave Management 🏥

**Leave Types:**
- Medical leave
- Duty leave
- Personal leave
- Emergency leave

**Features:**
- Proper attendance calculation (excludes approved leave)
- Document upload support
- Approval workflow
- Date range tracking
- Affected subjects listing

---

## Architecture

### Backend Structure

```
backend/
├── models/
│   ├── Attendance.js (Enhanced with locking)
│   ├── AuditLog.js (Complete audit trail)
│   ├── AttendanceCorrectionRequest.js
│   ├── Leave.js (Enhanced)
│   ├── SubstituteTeacher.js
│   └── Timetable.js (Existing)
│
├── controllers/
│   ├── attendanceController.js (Existing)
│   ├── attendanceEnhancedController.js (HOD override, corrections)
│   ├── reportController.js (Monthly Excel reports)
│   ├── studentAnalyticsController.js (Analytics)
│   └── timetableController.js (Existing)
│
├── routes/
│   ├── attendance.js (Existing)
│   ├── attendanceEnhanced.js (New features)
│   ├── reports.js (Excel downloads)
│   ├── studentAnalytics.js (Analytics)
│   └── timetable.js (Existing)
│
├── utils/
│   ├── TimetableParser.js (Existing)
│   ├── monthlyReportGenerator.js (Excel generation)
│   ├── attendanceNotifications.js (Alert system)
│   ├── studentAttendanceAnalytics.js (Detailed analytics)
│   └── scheduler.js (Enhanced with 5 cron jobs)
│
└── server.js (Enhanced with new routes)
```

---

## Installation

### Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **New dependency added:**
```bash
npm install exceljs
```

3. **Environment variables (.env):**
```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=aits_csms
PORT=8001
JWT_SECRET=your_secret_key
NODE_ENV=production
```

4. **Start server:**
```bash
npm start
```

The server will automatically:
- Initialize 5 cron jobs
- Start attendance locking (hourly)
- Schedule weekly alerts (Monday 8 AM)
- Schedule monthly reports (1st of month 2 AM)

---

## API Endpoints

### Complete Endpoint List (25+ endpoints)

#### Timetable Management
- `POST /api/timetable/upload` - Upload timetable (Admin)
- `GET /api/timetable/section/:sectionName` - Get timetable
- `GET /api/timetable/today/:sectionName` - Today's schedule
- `GET /api/timetable/current-slot/:sectionName` - Current class

#### Attendance (Basic)
- `POST /api/attendance/mark` - Mark attendance (Teacher)
- `GET /api/attendance/student/:studentId` - Student attendance
- `GET /api/attendance/student/:studentId/stats` - Statistics

#### Attendance (Enhanced) ⭐
- `POST /api/attendance-enhanced/hod-override` - HOD override
- `POST /api/attendance-enhanced/lock/:id` - Lock attendance
- `POST /api/attendance-enhanced/unlock/:id` - Unlock (HOD)
- `GET /api/attendance-enhanced/audit/:id` - Audit trail
- `GET /api/attendance-enhanced/audit/section/:name` - Section audit

#### Correction Requests
- `POST /api/attendance-enhanced/correction-request` - Submit (Student)
- `GET /api/attendance-enhanced/correction-requests/pending` - View pending
- `PUT /api/attendance-enhanced/correction-request/:id` - Review

#### Monthly Reports
- `GET /api/reports/monthly/:section?month=11&year=2025` - Download report
- `GET /api/reports/monthly-comprehensive/:section` - All subjects
- `POST /api/reports/generate-all` - Generate all (Admin)
- `GET /api/reports/available-months/:section` - Available months

#### Student Analytics
- `GET /api/student-analytics/attendance/:id` - Comprehensive analytics
- `GET /api/student-analytics/attendance/:id/monthly` - Monthly breakdown
- `GET /api/student-analytics/attendance/:id/compare` - Section comparison
- `GET /api/student-analytics/attendance/:id/warnings` - Warnings only

Full API documentation: [ENHANCED_ATTENDANCE_API.md](./ENHANCED_ATTENDANCE_API.md)

---

## Database Models

### New Models

#### 1. AuditLog
```javascript
{
  action: 'CREATE | UPDATE | DELETE | OVERRIDE | LOCK | UNLOCK',
  entityType: 'ATTENDANCE | TIMETABLE | LEAVE',
  entityId: ObjectId,
  performedBy: { userId, userType, userName },
  context: { section, subject, date, time, studentId },
  changes: { before, after },
  reason: String,
  ipAddress: String,
  timestamp: Date
}
```

#### 2. AttendanceCorrectionRequest
```javascript
{
  studentId: ObjectId,
  attendanceId: ObjectId,
  section: String,
  subject: String,
  date: Date,
  currentStatus: 'present | absent | late',
  requestedStatus: 'present | absent | late',
  reason: String,
  proofUrl: String,
  status: 'PENDING | APPROVED | REJECTED',
  reviewedBy: { userId, userType, userName },
  reviewComments: String
}
```

#### 3. SubstituteTeacher
```javascript
{
  originalTeacherId: ObjectId,
  substituteTeacherId: ObjectId,
  section: String,
  subject: String,
  date: Date,
  time: String,
  reason: String,
  status: 'PENDING | CONFIRMED | COMPLETED | CANCELLED',
  attendanceMarked: Boolean
}
```

### Enhanced Models

#### Attendance (Enhanced)
```javascript
{
  // Existing fields...
  isLocked: Boolean,
  lockedAt: Date,
  lastModifiedBy: { userId, userType, userName },
  lastModifiedAt: Date,
  overrideReason: String,
  updatedAt: Date
}
```

#### Leave (Enhanced)
```javascript
{
  // Existing fields...
  documentUrl: String,
  cloudinaryPublicId: String,
  approvalDate: Date,
  rejectionReason: String,
  affectedSubjects: [{ subject, date, slot }]
}
```

---

## Cron Jobs

### Automated Scheduled Tasks

| Job | Schedule | Description |
|-----|----------|-------------|
| Risk Detection | Daily 2 AM | Update at-risk student flags |
| Monthly Reports | 1st of month, 2 AM | Generate Excel reports for all sections |
| Attendance Locking | Every hour | Lock attendance after 15-min grace period |
| Weekly Alerts | Monday 8 AM | Send low attendance warnings to students |
| Unmarked Check | Every 30 min (8 AM-6 PM, Mon-Sat) | Alert teachers for unmarked attendance |

**Logs:**
All cron jobs log to console with timestamps and results.

---

## Usage Examples

### 1. HOD Override Scenario

**Situation:** Teacher forgot to mark attendance for OS class on Nov 20.

**Solution:**
```javascript
POST /api/attendance-enhanced/hod-override
{
  "section": "CSE-A",
  "subject": "Operating Systems",
  "date": "2025-11-20",
  "time": "10-11",
  "day": "WED",
  "studentAttendance": [
    { "studentId": "6740...", "status": "present" },
    { "studentId": "6741...", "status": "absent" }
  ],
  "reason": "Teacher forgot to mark attendance"
}
```

Result:
- Attendance created retroactively
- Audit log entry created
- Students' records updated
- HOD reason stored

### 2. Student Correction Request

**Situation:** Student marked absent but was actually present.

**Steps:**

1. Student submits request:
```javascript
POST /api/attendance-enhanced/correction-request
{
  "attendanceId": "6740...",
  "requestedStatus": "present",
  "reason": "I was present but marked absent by mistake",
  "proofUrl": "https://cloudinary.com/proof.jpg"
}
```

2. Teacher reviews:
```javascript
GET /api/attendance-enhanced/correction-requests/pending?section=CSE-A
```

3. Teacher approves:
```javascript
PUT /api/attendance-enhanced/correction-request/6740...
{
  "status": "APPROVED",
  "reviewComments": "Verified with classmates"
}
```

Result:
- Attendance status updated from 'absent' to 'present'
- Student model updated
- Audit log created
- Student notified

### 3. Monthly Report Generation

**Automatic (1st of month):**
System auto-generates reports for all sections and saves to `/backend/reports/`

**Manual Download:**
```javascript
GET /api/reports/monthly/CSE-A?month=11&year=2025
```

**Response:** Excel file with:
- Subject-wise sheets
- Color-coded rows
- Summary statistics
- Professional formatting

### 4. Student Analytics

**Get comprehensive analytics:**
```javascript
GET /api/student-analytics/attendance/6740...
```

**Response includes:**
- Overall percentage
- Subject-wise breakdown
- Warnings (critical, trending)
- Suggestions (classes needed)
- Weekly/monthly trends
- At-risk status

---

## Security

### Implemented Security Measures

1. **Authentication:**
   - JWT-based authentication
   - Role-based access control
   - Token expiry (7 days)

2. **Authorization:**
   - Admin: Full access
   - Teacher: Limited to assigned sections
   - Student: Own data only

3. **Audit Trail:**
   - All changes logged
   - IP address tracking
   - Timestamp recording
   - User identification

4. **Input Validation:**
   - MongoDB injection protection
   - XSS prevention
   - Rate limiting

5. **Attendance Locking:**
   - Prevents unauthorized modifications
   - HOD override with reason
   - Audit log for unlocks

---

## Troubleshooting

### Common Issues

#### 1. Timetable Upload Fails

**Error:** "No valid sections found"

**Solution:**
- Ensure section names end with colon (`:`)
- Check day codes (MON, TUE, WED, THU, FRI)
- Verify time format (9-10, not 09:00-10:00)
- Remove extra spaces

#### 2. Teacher Cannot Mark Attendance

**Error:** "No class in session currently"

**Causes:**
- Not within class time or grace period
- Server time zone mismatch
- Timetable not uploaded

**Solution:**
- Check current time vs. timetable
- Verify grace period (15 min after class)
- Confirm timetable exists for section

#### 3. Monthly Report Generation Fails

**Error:** "Failed to generate report"

**Causes:**
- No attendance data for the month
- Invalid month/year parameter
- Section not found

**Solution:**
- Verify attendance data exists
- Check date parameters (1-12 for month)
- Confirm section name is correct

#### 4. Correction Request Not Updating

**Possible reasons:**
- Attendance record not found
- Request already processed
- Student not in attendance record

**Solution:**
- Check attendanceId is correct
- Verify student was in the class
- Review audit logs

---

## Performance Considerations

### Optimizations

1. **Database Indexes:**
   - Compound indexes on attendance queries
   - Section and date indexes
   - Student ID indexes

2. **Caching:**
   - Current slot caching (recommended)
   - Timetable caching for active sections

3. **Batch Operations:**
   - Monthly report generation in batches
   - Bulk attendance updates

4. **Query Optimization:**
   - Selective field population
   - Pagination on list endpoints
   - Efficient time-based queries

---

## Future Enhancements

### Recommended Features

1. **Mobile App:**
   - QR code-based attendance
   - Push notifications
   - Offline capability

2. **Advanced Analytics:**
   - Predictive attendance warnings
   - ML-based risk detection
   - Attendance patterns analysis

3. **Integration:**
   - SMS gateway for critical alerts
   - Email notifications
   - Calendar sync

4. **Reporting:**
   - PDF generation
   - Custom report builder
   - Export to other formats

---

## Support & Maintenance

### Logs Location
- Application logs: Console output
- Cron job logs: Console with timestamps
- Error logs: Console errors

### Backup Recommendations
- Daily database backups
- Monthly report archives
- Audit log preservation

### Monitoring
- Server uptime
- Cron job execution
- Database performance
- API response times

---

## Credits

**Developed for:** AITS College  
**Version:** 2.0.0  
**Last Updated:** November 2025

**Technologies Used:**
- Node.js + Express.js
- MongoDB + Mongoose
- ExcelJS
- Node-Cron
- JWT Authentication

---

## License

This system is part of the AITS CSMS project and follows the project's licensing terms.

---

**For detailed API documentation, see:** [ENHANCED_ATTENDANCE_API.md](./ENHANCED_ATTENDANCE_API.md)
