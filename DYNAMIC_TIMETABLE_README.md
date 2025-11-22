# Dynamic Timetable + Dynamic Attendance Module

## Overview

This module implements a fully dynamic timetable and attendance system for the AITS CSMS. Everything is controlled by the timetable uploaded by the HOD - no hardcoded subjects, no manual subject selection.

## Key Features

### 🎯 Core Capabilities

- **Text-Based Timetable Upload**: Simple plain text format for easy timetable creation
- **Auto-Subject Detection**: Attendance subject is automatically detected based on current time
- **Dynamic Subject Lists**: All subjects are derived from timetable, not hardcoded
- **Teacher Auto-Assignment**: Automatic linking of subjects to teachers
- **Time-Based Validation**: 15-minute grace period for attendance marking
- **Duplicate Prevention**: Cannot mark attendance twice for same session
- **Real-Time Updates**: Current class detection with auto-refresh
- **Clash Detection**: Validates timetable for scheduling conflicts

### 📋 Timetable Format

HOD uploads timetable in this simple text format:

```
CSE-A:
MON: 9-10 DS, 10-11 CO, 11-12 OS, 1-2 DAA, 2-3 FLAT
TUE: 9-10 OS, 10-11 AI, 11-12 DS, 1-2 DAA, 2-3 CO
WED: 9-10 FLAT, 10-11 DS, 11-12 DAA, 1-2 OS, 2-3 AI
THU: 9-10 CO, 10-11 FLAT, 11-12 AI, 1-2 DS, 2-3 OS
FRI: 9-10 DAA, 10-11 OS, 11-12 CO, 1-2 FLAT, 2-3 DS

CSE-B:
MON: 9-10 CN, 10-11 OS, 11-12 DBMS, 1-2 JAVA, 2-3 DAA
TUE: 9-10 ML, 10-11 FLAT, 11-12 CN, 1-2 DS, 2-3 OS
```

**Format Rules:**
- Section name followed by colon (e.g., `CSE-A:`)
- Day codes: MON, TUE, WED, THU, FRI, SAT, SUN
- Time format: `9-10`, `1-2` (12-hour, morning 9-12, afternoon 1-8)
- Separate slots with commas
- Blank line between sections

## Backend Architecture

### Models

#### Timetable Model (`backend/models/Timetable.js`)

```javascript
{
  section: String,              // e.g., "CSE-A"
  sectionId: ObjectId,          // Reference to Section
  schedule: {
    MON: [SlotSchema],
    TUE: [SlotSchema],
    WED: [SlotSchema],
    THU: [SlotSchema],
    FRI: [SlotSchema],
    SAT: [SlotSchema],
    SUN: [SlotSchema]
  },
  uploadedBy: ObjectId,
  isActive: Boolean
}
```

**SlotSchema:**
```javascript
{
  time: String,        // "9-10"
  startTime: String,   // "09:00"
  endTime: String,     // "10:00"
  subject: String,     // "Data Structures"
  teacher: ObjectId    // Reference to Teacher
}
```

#### Attendance Model (`backend/models/Attendance.js`)

```javascript
{
  section: String,
  sectionId: ObjectId,
  subject: String,
  teacher: ObjectId,
  date: Date,
  day: String,
  time: String,
  startTime: String,
  endTime: String,
  students: [
    {
      studentId: ObjectId,
      status: 'present' | 'absent' | 'late',
      markedAt: Date
    }
  ],
  isLocked: Boolean
}
```

### API Endpoints

#### Timetable APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/timetable/upload` | Upload and parse timetable | Admin |
| GET | `/api/timetable` | Get all timetables | Auth |
| GET | `/api/timetable/section/:sectionName` | Get timetable for section | Auth |
| GET | `/api/timetable/today/:sectionName` | Get today's schedule | Auth |
| GET | `/api/timetable/teacher/today` | Get teacher's today schedule | Teacher |
| GET | `/api/timetable/current-slot/:sectionName` | Get current class | Auth |
| DELETE | `/api/timetable/:sectionName` | Delete timetable | Admin |

#### Attendance APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/attendance/mark` | Mark attendance (auto-detects subject) | Teacher |
| GET | `/api/attendance/student/:studentId` | Get student attendance | Auth |
| GET | `/api/attendance/student/:studentId/stats` | Get attendance statistics | Auth |
| GET | `/api/attendance/section/:sectionName` | Get section attendance | Teacher/Admin |
| GET | `/api/attendance/current-slot/:section` | Get current slot info | Teacher |

### Utilities

#### TimetableParser (`backend/utils/TimetableParser.js`)

**Key Methods:**
- `parse(timetableText)`: Converts text to structured JSON
- `validate(timetables)`: Validates for clashes and errors
- `detectClashes(schedule)`: Finds time conflicts
- `parseTimeRange(time)`: Converts to 24-hour format

## Frontend Components

### Admin/HOD Pages

#### TimetableUpload (`frontend/src/pages/admin/TimetableUpload.jsx`)

Features:
- Text area for timetable input
- Format guide and sample loader
- Real-time validation feedback
- Display of warnings and errors
- Upload results with section summary

### Student Pages

#### Student Timetable (`frontend/src/pages/student/Timetable.jsx`)

Features:
- Current class card with live updates
- Today's schedule with time-based highlighting
- Weekly timetable grid view
- Auto-refresh every minute
- Teacher information display

#### Student Attendance (`frontend/src/pages/student/Attendance.jsx`)

Features:
- Overall attendance percentage
- Subject-wise attendance cards
- Attendance history with filters
- Low attendance warnings
- Backward compatible with old API

### Teacher Pages

#### Teacher Timetable (`frontend/src/pages/teacher/Timetable.jsx`)

Features:
- Current period card
- Today's teaching schedule
- Section-wise period view
- Quick statistics (subjects, sections, periods)
- Real-time period tracking

#### Mark Attendance (`frontend/src/pages/teacher/MarkAttendance.jsx`)

Features:
- Auto-detection of current subject
- Section selector
- Student list with photos
- Bulk mark present/absent
- Real-time attendance summary
- Time-based validation feedback

## How It Works

### 1. Timetable Upload Flow

```
HOD uploads text → TimetableParser parses → 
Validation checks → Auto-assign teachers → 
Save to database → Return results
```

### 2. Current Slot Detection

```
User requests current slot →
Get today's day (e.g., MON) →
Get current time (e.g., 10:15) →
Find slot where startTime ≤ currentTime < endTime →
Return slot with subject and teacher
```

### 3. Attendance Marking Flow

```
Teacher opens attendance page →
System detects: current time, section, day →
Finds current slot from timetable →
Auto-populates: subject, time, section →
Teacher marks students →
Validates: time window, teacher authorization →
Prevents duplicate marking →
Saves to database
```

## Time Handling

### Time Conversion

- **Morning (9-12)**: Stays as AM → 09:00, 10:00, 11:00, 12:00
- **Afternoon (1-8)**: Converts to PM → 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00

### Grace Period

- Attendance can be marked during class time
- OR within **15 minutes** after class ends
- Prevents late marking abuse
- Configurable via `GRACE_PERIOD_MINUTES` constant

## Validation & Error Handling

### Timetable Validation

✅ **Checks for:**
- Invalid time formats
- Time clashes within same day
- Missing subjects
- Invalid day codes
- Overlapping periods

⚠️ **Warnings for:**
- Missing days (WED, THU, FRI not scheduled)
- Unassigned teachers

### Attendance Validation

✅ **Prevents:**
- Duplicate attendance for same session
- Marking outside time window
- Unauthorized teachers marking attendance
- Invalid student IDs

## Database Indexes

### Timetable
```javascript
{ section: 1, isActive: 1 }
```

### Attendance
```javascript
// Unique constraint
{ section: 1, subject: 1, date: 1, time: 1 }

// Query optimization
{ sectionId: 1, date: 1 }
{ teacher: 1, date: 1 }
```

## Migration Notes

### Backward Compatibility

The system maintains backward compatibility with existing attendance data:

1. **Student Model**: Attendance still stored in embedded array
2. **Fallback APIs**: Frontend tries new API, falls back to old one
3. **Dual Write**: New attendance controller updates both models
4. **Gradual Migration**: Can run both systems simultaneously

### Data Migration

To migrate existing data:

```javascript
// Example migration script (not included)
// 1. Extract attendance from Student model
// 2. Create Attendance documents
// 3. Link to timetable slots
// 4. Verify data integrity
```

## Configuration

### Environment Variables

No new environment variables required. Uses existing MongoDB and JWT configuration.

### Constants

```javascript
// Grace period for attendance (minutes)
const GRACE_PERIOD_MINUTES = 15;
```

## Testing

### Unit Tests

```bash
# Test TimetableParser
node -e "
const TimetableParser = require('./backend/utils/TimetableParser.js');
const result = TimetableParser.parse('CSE-A:\nMON: 9-10 DS');
console.log(result);
"
```

### Integration Tests

- Upload sample timetable via API
- Verify auto-teacher assignment
- Test current slot detection
- Mark attendance and verify
- Check duplicate prevention

## Future Enhancements

### Planned Features
- [ ] Exam schedule integration
- [ ] Assignment deadline linking
- [ ] Substitute teacher assignment
- [ ] Holiday calendar integration
- [ ] Attendance report generation
- [ ] Email notifications for low attendance
- [ ] Mobile app notifications
- [ ] QR code based attendance

### Optimization Ideas
- [ ] Cache current slot for performance
- [ ] Batch attendance marking
- [ ] Attendance trends analytics
- [ ] Predictive attendance warnings

## Troubleshooting

### Common Issues

**Issue**: Timetable upload fails with "No valid sections found"
- **Solution**: Ensure section name ends with colon and has no spaces

**Issue**: Current slot always null
- **Solution**: Check time format (9-12 AM, 1-8 PM) and server time zone

**Issue**: Teacher cannot mark attendance
- **Solution**: Verify teacher is assigned to subject in Teacher model

**Issue**: Attendance marked outside class time
- **Solution**: Check GRACE_PERIOD_MINUTES setting and system time

## Security Considerations

✅ **Implemented:**
- Role-based access control (Admin, Teacher, Student)
- JWT authentication on all endpoints
- Input validation and sanitization
- Duplicate prevention with unique indexes
- Teacher authorization checks

✅ **CodeQL Scan**: No security vulnerabilities found

## Performance

### Optimizations
- MongoDB indexes for fast queries
- Pagination support on list endpoints
- Selective field population
- Client-side caching with auto-refresh
- Efficient time-based queries

### Expected Load
- Timetable uploads: Infrequent (weekly/monthly)
- Current slot queries: Moderate (per page load)
- Attendance marking: Peak during class transitions

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoints and models
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Verify database connections and data

## License

Part of AITS CSMS - All Rights Reserved
