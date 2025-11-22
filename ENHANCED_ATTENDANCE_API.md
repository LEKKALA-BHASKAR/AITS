# Timetable-Driven Attendance System - Complete API Documentation

## Overview

This document provides comprehensive API documentation for the enhanced timetable-driven attendance system with HOD override, audit logging, monthly reports, and advanced analytics.

---

## Table of Contents

1. [Authentication](#authentication)
2. [HOD Override & Audit](#hod-override--audit)
3. [Attendance Corrections](#attendance-corrections)
4. [Monthly Reports](#monthly-reports)
5. [Student Analytics](#student-analytics)
6. [Leave Management](#leave-management)
7. [Notifications](#notifications)

---

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

**Role-based Access:**
- `admin` - HOD/Admin (full access)
- `teacher` - Teacher (limited access)
- `student` - Student (own data only)

---

## HOD Override & Audit

### 1. HOD Override Attendance

Create or update attendance records anytime (Admin only).

**Endpoint:** `POST /api/attendance-enhanced/hod-override`

**Authorization:** Admin only

**Request Body:**
```json
{
  "attendanceId": "optional - for updating existing",
  "section": "CSE-A",
  "subject": "Data Structures",
  "date": "2025-11-22",
  "time": "9-10",
  "day": "FRI",
  "startTime": "09:00",
  "endTime": "10:00",
  "studentAttendance": [
    {
      "studentId": "6740...",
      "status": "present"
    },
    {
      "studentId": "6741...",
      "status": "absent"
    }
  ],
  "reason": "Correcting attendance after technical issue"
}
```

**Response:**
```json
{
  "message": "Attendance override successful",
  "attendance": { ... }
}
```

**Use Cases:**
- Retroactive attendance entry
- Correcting mistakes
- Adding missed attendance
- Emergency situations

---

### 2. Lock Attendance

Lock an attendance record (prevents teacher modifications).

**Endpoint:** `POST /api/attendance-enhanced/lock/:attendanceId`

**Authorization:** Admin, Teacher

**Response:**
```json
{
  "message": "Attendance locked successfully"
}
```

---

### 3. Unlock Attendance

Unlock a locked attendance record (Admin only).

**Endpoint:** `POST /api/attendance-enhanced/unlock/:attendanceId`

**Authorization:** Admin only

**Request Body:**
```json
{
  "reason": "Allowing corrections after student request"
}
```

---

### 4. Get Audit Trail

Retrieve complete audit history for an attendance record.

**Endpoint:** `GET /api/attendance-enhanced/audit/:attendanceId`

**Authorization:** Admin, Teacher

**Query Parameters:**
- `limit` (optional) - Number of records (default: 50)

**Response:**
```json
[
  {
    "action": "OVERRIDE",
    "entityType": "ATTENDANCE",
    "performedBy": {
      "userId": "6740...",
      "userType": "admin",
      "userName": "Dr. Smith"
    },
    "context": {
      "section": "CSE-A",
      "subject": "OS",
      "date": "2025-11-22",
      "time": "9-10"
    },
    "changes": {
      "before": { ... },
      "after": { ... }
    },
    "reason": "HOD override",
    "timestamp": "2025-11-22T10:30:00Z"
  }
]
```

---

### 5. Get Section Audit Logs

Retrieve audit logs for a section within a date range.

**Endpoint:** `GET /api/attendance-enhanced/audit/section/:sectionName`

**Authorization:** Admin, Teacher

**Query Parameters:**
- `startDate` (optional) - Start date (ISO format)
- `endDate` (optional) - End date (ISO format)
- `limit` (optional) - Number of records (default: 200)

---

## Attendance Corrections

### 6. Submit Correction Request (Student)

Student requests attendance correction.

**Endpoint:** `POST /api/attendance-enhanced/correction-request`

**Authorization:** Student

**Request Body:**
```json
{
  "attendanceId": "6740...",
  "requestedStatus": "present",
  "reason": "I was present but marked absent by mistake. I have proof.",
  "proofUrl": "https://cloudinary.com/..."
}
```

**Response:**
```json
{
  "message": "Correction request submitted successfully",
  "request": {
    "studentId": "6740...",
    "attendanceId": "6741...",
    "currentStatus": "absent",
    "requestedStatus": "present",
    "status": "PENDING",
    "requestedAt": "2025-11-22T14:30:00Z"
  }
}
```

---

### 7. Get Pending Correction Requests

Retrieve pending correction requests.

**Endpoint:** `GET /api/attendance-enhanced/correction-requests/pending`

**Authorization:** Admin, Teacher

**Query Parameters:**
- `section` (optional) - Filter by section
- `limit` (optional) - Number of records (default: 50)

**Response:**
```json
[
  {
    "_id": "6740...",
    "studentId": {
      "name": "John Doe",
      "rollNumber": "21CS001",
      "imageURL": "..."
    },
    "section": "CSE-A",
    "subject": "Data Structures",
    "date": "2025-11-20",
    "time": "9-10",
    "currentStatus": "absent",
    "requestedStatus": "present",
    "reason": "I was present...",
    "status": "PENDING",
    "requestedAt": "2025-11-22T14:30:00Z"
  }
]
```

---

### 8. Review Correction Request

Approve or reject a correction request.

**Endpoint:** `PUT /api/attendance-enhanced/correction-request/:requestId`

**Authorization:** Admin, Teacher

**Request Body:**
```json
{
  "status": "APPROVED",
  "reviewComments": "Verified with classmates. Approving correction."
}
```

**Possible status values:**
- `APPROVED` - Approve and update attendance
- `REJECTED` - Reject the request

**Response:**
```json
{
  "message": "Correction request approved",
  "request": { ... }
}
```

---

## Monthly Reports

### 9. Download Monthly Report (Single Section)

Download Excel report for a specific section and month.

**Endpoint:** `GET /api/reports/monthly/:sectionName`

**Authorization:** Admin, Teacher

**Query Parameters:**
- `month` (required) - Month (1-12)
- `year` (required) - Year (e.g., 2025)
- `subject` (optional) - Specific subject

**Example:**
```
GET /api/reports/monthly/CSE-A?month=11&year=2025
```

**Response:** Excel file download (.xlsx)

**File Format:**
- Multiple sheets (one per subject)
- Color-coded rows:
  - 🟢 Green: >= 75%
  - 🟡 Yellow: 65-74.99%
  - 🔴 Red: < 65%
- Columns: Roll Number, Name, Total Classes, Attended, Percentage, Status
- Summary row with counts

**Filename Format:**
```
CSE-A_Attendance_Report_November_2025.xlsx
```

---

### 10. Download Comprehensive Report

Download report for all subjects in a section.

**Endpoint:** `GET /api/reports/monthly-comprehensive/:sectionName`

**Authorization:** Admin, Teacher

**Query Parameters:**
- `month` (required)
- `year` (required)

---

### 11. Generate All Reports (Manual Trigger)

Manually trigger report generation for all sections.

**Endpoint:** `POST /api/reports/generate-all`

**Authorization:** Admin only

**Request Body:**
```json
{
  "month": 11,
  "year": 2025
}
```

**Response:**
```json
{
  "message": "Generated 5 reports successfully, 0 failed",
  "reports": [
    {
      "section": "CSE-A",
      "filename": "CSE-A_Attendance_Report_November_2025.xlsx",
      "success": true
    },
    {
      "section": "CSE-B",
      "filename": "CSE-B_Attendance_Report_November_2025.xlsx",
      "success": true
    }
  ]
}
```

---

### 12. Get Available Months

Get list of months with attendance data for a section.

**Endpoint:** `GET /api/reports/available-months/:sectionName`

**Authorization:** Authenticated user

**Response:**
```json
{
  "months": [
    {
      "year": 2025,
      "month": 11,
      "key": "2025-11"
    },
    {
      "year": 2025,
      "month": 10,
      "key": "2025-10"
    }
  ]
}
```

---

## Student Analytics

### 13. Get Comprehensive Attendance Analytics

Get detailed analytics with warnings and suggestions.

**Endpoint:** `GET /api/student-analytics/attendance/:studentId`

**Authorization:** Student (own data), Admin, Teacher

**Response:**
```json
{
  "overall": {
    "totalClasses": 120,
    "attended": 95,
    "absent": 25,
    "percentage": 79.17,
    "status": "GOOD"
  },
  "bySubject": [
    {
      "subject": "Operating Systems",
      "total": 25,
      "attended": 16,
      "absent": 9,
      "late": 0,
      "percentage": 64.00,
      "lastClass": "2025-11-21",
      "recentAttendance": [
        { "date": "2025-11-21", "status": "absent" },
        { "date": "2025-11-20", "status": "present" }
      ]
    },
    {
      "subject": "Data Structures",
      "total": 30,
      "attended": 28,
      "percentage": 93.33
    }
  ],
  "warnings": [
    {
      "type": "CRITICAL",
      "subject": "Operating Systems",
      "message": "Your attendance in Operating Systems is 64%. This is critically low.",
      "severity": "high"
    },
    {
      "type": "TREND",
      "subject": "Operating Systems",
      "message": "You have 3 absences in your last 5 classes in Operating Systems.",
      "severity": "medium"
    }
  ],
  "suggestions": [
    {
      "subject": "Operating Systems",
      "message": "To improve Operating Systems attendance: You need to attend approximately 4 consecutive classes without missing.",
      "classesNeeded": 4
    }
  ],
  "trends": {
    "lastWeek": {
      "percentage": "75.00",
      "classes": 8,
      "attended": 6
    },
    "lastMonth": {
      "percentage": "78.50",
      "classes": 28,
      "attended": 22
    }
  },
  "atRisk": true,
  "needsAttention": true
}
```

**Status Values:**
- `EXCELLENT` - >= 85%
- `GOOD` - 75-84%
- `WARNING` - 65-74%
- `CRITICAL` - < 65%
- `NO_DATA` - No attendance records

---

### 14. Get Monthly Attendance Breakdown

Get detailed day-by-day attendance for a specific month.

**Endpoint:** `GET /api/student-analytics/attendance/:studentId/monthly`

**Authorization:** Student (own data), Admin, Teacher

**Query Parameters:**
- `month` (required) - Month (1-12)
- `year` (required) - Year

**Example:**
```
GET /api/student-analytics/attendance/6740.../monthly?month=11&year=2025
```

**Response:**
```json
{
  "month": 11,
  "year": 2025,
  "dailyAttendance": [
    {
      "date": "2025-11-01",
      "day": "FRI",
      "subject": "Data Structures",
      "time": "9-10",
      "status": "present"
    },
    {
      "date": "2025-11-01",
      "day": "FRI",
      "subject": "Operating Systems",
      "time": "10-11",
      "status": "absent"
    }
  ],
  "subjects": [
    {
      "subject": "Data Structures",
      "total": 12,
      "attended": 11,
      "percentage": "91.67"
    }
  ],
  "totalClasses": 48,
  "totalAttended": 38
}
```

---

### 15. Compare with Section Average

Compare student's attendance with section average.

**Endpoint:** `GET /api/student-analytics/attendance/:studentId/compare`

**Authorization:** Student (own data), Admin, Teacher

**Response:**
```json
{
  "studentPercentage": 79.17,
  "sectionAverage": 82.45,
  "difference": "-3.28",
  "aboveAverage": false,
  "studentsInSection": 60
}
```

---

### 16. Get Warnings and Suggestions Only

Get only warnings and suggestions (lightweight endpoint).

**Endpoint:** `GET /api/student-analytics/attendance/:studentId/warnings`

**Authorization:** Student (own data), Admin, Teacher

**Response:**
```json
{
  "warnings": [ ... ],
  "suggestions": [ ... ],
  "atRisk": true,
  "needsAttention": true
}
```

---

## Leave Management

### 17. Check Leave Status

Check if student is on approved leave for a specific date.

**Endpoint:** `GET /api/attendance-enhanced/leave-status/:studentId/:date`

**Authorization:** Authenticated user

**Example:**
```
GET /api/attendance-enhanced/leave-status/6740.../2025-11-22
```

**Response:**
```json
{
  "isOnLeave": true
}
```

---

## Automated Processes

### Cron Jobs

The system runs the following automated tasks:

1. **Daily Risk Detection** - 2:00 AM
   - Updates at-risk student flags

2. **Monthly Report Generation** - 1st of month, 2:00 AM
   - Auto-generates Excel reports for all sections
   - Saves to `/backend/reports/` directory

3. **Attendance Locking** - Every hour
   - Locks attendance records after grace period (15 min)

4. **Weekly Attendance Alerts** - Every Monday, 8:00 AM
   - Sends low attendance warnings to students
   - Alerts HOD for critical cases (<65%)

5. **Unmarked Attendance Check** - Every 30 minutes (8 AM - 6 PM, Mon-Sat)
   - Alerts teachers if attendance not marked within 10 minutes

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- File uploads: 20 uploads per hour

---

## Data Validation

### Attendance Status Values
- `present` - Student attended
- `absent` - Student did not attend
- `late` - Student arrived late

### Leave Types
- `MEDICAL` - Medical leave
- `DUTY` - Official duty
- `PERSONAL` - Personal reasons
- `EMERGENCY` - Emergency leave

### Audit Actions
- `CREATE` - New record created
- `UPDATE` - Record updated
- `DELETE` - Record deleted
- `OVERRIDE` - HOD override
- `LOCK` - Attendance locked
- `UNLOCK` - Attendance unlocked
- `CORRECTION_APPROVED` - Correction approved
- `CORRECTION_REJECTED` - Correction rejected

---

## Best Practices

1. **HOD Override:**
   - Always provide a clear reason
   - Use for legitimate corrections only
   - Review audit logs regularly

2. **Monthly Reports:**
   - Download at month-end
   - Archive for record-keeping
   - Share with relevant stakeholders

3. **Correction Requests:**
   - Students should provide proof when possible
   - Review promptly (within 2-3 days)
   - Add detailed review comments

4. **Analytics:**
   - Check student warnings weekly
   - Act on critical alerts immediately
   - Use suggestions to guide students

5. **Security:**
   - Never share authentication tokens
   - Logout after session
   - Report suspicious activity

---

## Support

For API issues or questions:
- Check error messages carefully
- Review this documentation
- Check server logs for debugging
- Contact system administrator

---

**Last Updated:** November 2025  
**Version:** 2.0.0
