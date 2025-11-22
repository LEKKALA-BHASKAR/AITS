/**
 * TimetableParser - Parses plain text timetable input into structured JSON
 * 
 * Input Format:
 * CSE-A:
 * MON: 9-10 DS, 10-11 CO, 11-12 OS, 1-2 DAA, 2-3 FLAT
 * TUE: 9-10 OS, 10-11 AI, 11-12 DS, 1-2 DAA, 2-3 CO
 * 
 * Output Format:
 * {
 *   section: "CSE-A",
 *   schedule: {
 *     MON: [{ time: "9-10", subject: "DS", teacher: null }, ...],
 *     TUE: [{ time: "9-10", subject: "OS", teacher: null }, ...]
 *   }
 * }
 */

const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

class TimetableParser {
  /**
   * Parse timetable text input
   * @param {string} timetableText - Raw timetable text
   * @returns {Array} Array of parsed timetable objects for each section
   */
  static parse(timetableText) {
    if (!timetableText || typeof timetableText !== 'string') {
      throw new Error('Invalid timetable text input');
    }

    const lines = timetableText.trim().split('\n').map(line => line.trim()).filter(line => line);
    const timetables = [];
    let currentSection = null;
    let currentSchedule = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a section header (ends with :)
      if (line.endsWith(':') && !line.includes(' ')) {
        // Save previous section if exists
        if (currentSection) {
          timetables.push({
            section: currentSection,
            schedule: currentSchedule
          });
        }

        // Start new section
        currentSection = line.slice(0, -1).trim();
        currentSchedule = {};
        continue;
      }

      // Parse day schedule line
      const dayMatch = line.match(/^([A-Z]{3}):\s*(.+)$/);
      if (dayMatch) {
        const day = dayMatch[1];
        const scheduleText = dayMatch[2];

        if (!VALID_DAYS.includes(day)) {
          throw new Error(`Invalid day: ${day}. Valid days are: ${VALID_DAYS.join(', ')}`);
        }

        if (!currentSection) {
          throw new Error(`Day schedule found without section header at line: ${line}`);
        }

        // Parse time slots
        const slots = this.parseTimeSlots(scheduleText, currentSection, day);
        currentSchedule[day] = slots;
      }
    }

    // Save last section
    if (currentSection) {
      timetables.push({
        section: currentSection,
        schedule: currentSchedule
      });
    }

    if (timetables.length === 0) {
      throw new Error('No valid timetable sections found');
    }

    return timetables;
  }

  /**
   * Parse time slots from schedule text
   * @param {string} scheduleText - Time slot text (e.g., "9-10 DS, 10-11 CO")
   * @param {string} section - Section name for error messages
   * @param {string} day - Day name for error messages
   * @returns {Array} Array of slot objects
   */
  static parseTimeSlots(scheduleText, section, day) {
    const slots = [];
    const slotTexts = scheduleText.split(',').map(s => s.trim()).filter(s => s);

    for (const slotText of slotTexts) {
      const parts = slotText.trim().split(/\s+/);
      
      if (parts.length < 2) {
        throw new Error(`Invalid slot format in ${section} on ${day}: "${slotText}". Expected format: "9-10 SUBJECT"`);
      }

      const time = parts[0];
      const subject = parts.slice(1).join(' '); // Handle multi-word subjects

      // Validate time format
      if (!this.isValidTimeFormat(time)) {
        throw new Error(`Invalid time format in ${section} on ${day}: "${time}". Expected format: "9-10" or "1-2"`);
      }

      // Parse start and end times
      const [start, end] = this.parseTimeRange(time);

      slots.push({
        time,
        startTime: start,
        endTime: end,
        subject: subject.trim(),
        teacher: null // Will be assigned later
      });
    }

    return slots;
  }

  /**
   * Validate time format (e.g., "9-10", "1-2")
   * @param {string} time - Time string
   * @returns {boolean} True if valid
   */
  static isValidTimeFormat(time) {
    return /^\d{1,2}-\d{1,2}$/.test(time);
  }

  /**
   * Parse time range into 24-hour format times
   * @param {string} time - Time string (e.g., "9-10", "1-2")
   * @returns {Array} [startTime, endTime] in "HH:MM" format
   */
  static parseTimeRange(time) {
    const [start, end] = time.split('-').map(t => parseInt(t.trim()));

    if (isNaN(start) || isNaN(end)) {
      throw new Error(`Invalid time values in: ${time}`);
    }

    if (start >= end) {
      throw new Error(`Start time must be before end time in: ${time}`);
    }

    if (start < 1 || start > 12 || end < 1 || end > 12) {
      throw new Error(`Time values must be between 1 and 12 in: ${time}`);
    }

    // Convert to 24-hour format (assuming AM for single digits, PM for afternoon)
    // 9-10 means 9:00 AM to 10:00 AM
    // 1-2 means 1:00 PM to 2:00 PM (13:00 to 14:00)
    const startHour = start < 9 ? start + 12 : start;
    const endHour = end < 9 ? end + 12 : end;

    return [
      `${String(startHour).padStart(2, '0')}:00`,
      `${String(endHour).padStart(2, '0')}:00`
    ];
  }

  /**
   * Detect timetable clashes within a section
   * @param {Object} schedule - Section schedule object
   * @returns {Array} Array of clash objects
   */
  static detectClashes(schedule) {
    const clashes = [];

    for (const [day, slots] of Object.entries(schedule)) {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          // Check if time slots overlap
          if (this.timesOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
            clashes.push({
              day,
              slot1: { time: slot1.time, subject: slot1.subject },
              slot2: { time: slot2.time, subject: slot2.subject }
            });
          }
        }
      }
    }

    return clashes;
  }

  /**
   * Check if two time ranges overlap
   * @param {string} start1 - Start time 1 (HH:MM)
   * @param {string} end1 - End time 1 (HH:MM)
   * @param {string} start2 - Start time 2 (HH:MM)
   * @param {string} end2 - End time 2 (HH:MM)
   * @returns {boolean} True if overlap exists
   */
  static timesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Validate parsed timetable data
   * @param {Array} timetables - Array of parsed timetable objects
   * @returns {Object} Validation result with errors and warnings
   */
  static validate(timetables) {
    const errors = [];
    const warnings = [];

    for (const timetable of timetables) {
      // Check for clashes
      const clashes = this.detectClashes(timetable.schedule);
      if (clashes.length > 0) {
        errors.push({
          section: timetable.section,
          type: 'CLASH',
          clashes
        });
      }

      // Check for missing subjects
      const subjects = new Set();
      for (const slots of Object.values(timetable.schedule)) {
        for (const slot of slots) {
          if (!slot.subject || slot.subject.trim() === '') {
            errors.push({
              section: timetable.section,
              type: 'MISSING_SUBJECT',
              message: 'Empty subject found'
            });
          } else {
            subjects.add(slot.subject);
          }
        }
      }

      // Warn if no schedule for certain days
      for (const day of VALID_DAYS.slice(0, 5)) { // MON-FRI
        if (!timetable.schedule[day] || timetable.schedule[day].length === 0) {
          warnings.push({
            section: timetable.section,
            type: 'MISSING_DAY',
            day,
            message: `No schedule found for ${day}`
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = TimetableParser;
