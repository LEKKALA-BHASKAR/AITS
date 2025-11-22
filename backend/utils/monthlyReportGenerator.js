const ExcelJS = require('exceljs');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Section = require('../models/Section');
const Leave = require('../models/Leave');

/**
 * Monthly Attendance Excel Report Generator
 * 
 * Generates color-coded Excel reports with:
 * - Green: >= 75% attendance
 * - Yellow: 65-74.99% attendance
 * - Red: < 65% attendance
 */

/**
 * Generate monthly attendance report for a section
 * @param {String} sectionName - Section name (e.g., "CSE-A")
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year (e.g., 2025)
 * @param {String} subject - Optional: specific subject
 * @returns {Buffer} Excel file buffer
 */
async function generateMonthlyReport(sectionName, month, year, subject = null) {
  try {
    // Get section details
    const section = await Section.findOne({ name: sectionName })
      .populate('students');
    
    if (!section) {
      throw new Error('Section not found');
    }
    
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get all attendance records for this section in the month
    const query = {
      section: sectionName,
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (subject) {
      query.subject = subject;
    }
    
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: 1, startTime: 1 });
    
    // Get all students in section
    const students = await Student.find({ sectionId: section._id })
      .sort({ rollNumber: 1 });
    
    // Get unique subjects
    const subjects = [...new Set(attendanceRecords.map(r => r.subject))];
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AITS CSMS';
    workbook.created = new Date();
    
    // Create worksheet for each subject
    for (const subj of subjects) {
      const worksheet = workbook.addWorksheet(subj.substring(0, 30)); // Excel sheet name limit
      
      // Add title
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `${sectionName} - ${subj} - Attendance Report`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Add month/year
      worksheet.mergeCells('A2:F2');
      const monthCell = worksheet.getCell('A2');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      monthCell.value = `${monthNames[month - 1]} ${year}`;
      monthCell.font = { bold: true, size: 12 };
      monthCell.alignment = { horizontal: 'center' };
      
      // Add blank row
      worksheet.addRow([]);
      
      // Add headers
      const headerRow = worksheet.addRow([
        'Roll Number',
        'Student Name',
        'Total Classes',
        'Classes Attended',
        'Percentage (%)',
        'Status'
      ]);
      
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A90E2' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Set column widths
      worksheet.columns = [
        { width: 15 },
        { width: 25 },
        { width: 15 },
        { width: 18 },
        { width: 15 },
        { width: 15 }
      ];
      
      // Get attendance records for this subject
      const subjectRecords = attendanceRecords.filter(r => r.subject === subj);
      
      // Calculate attendance for each student
      for (const student of students) {
        let totalClasses = 0;
        let attended = 0;
        
        for (const record of subjectRecords) {
          // Check if student is in this record
          const studentAtt = record.students.find(
            s => s.studentId.toString() === student._id.toString()
          );
          
          if (studentAtt) {
            totalClasses++;
            if (studentAtt.status === 'present') {
              attended++;
            }
          } else {
            // Check if student was on leave
            const isOnLeave = await Leave.isOnLeave(student._id, record.date);
            if (!isOnLeave) {
              totalClasses++;
              // Absent if not in record and not on leave
            }
          }
        }
        
        const percentage = totalClasses > 0 
          ? ((attended / totalClasses) * 100).toFixed(2)
          : 0;
        
        let status = 'Normal';
        let fillColor = 'FF90EE90'; // Green
        
        if (percentage < 65) {
          status = 'Critical';
          fillColor = 'FFFF6B6B'; // Red
        } else if (percentage < 75) {
          status = 'Warning';
          fillColor = 'FFFFD93D'; // Yellow
        }
        
        const dataRow = worksheet.addRow([
          student.rollNumber,
          student.name,
          totalClasses,
          attended,
          percentage,
          status
        ]);
        
        // Apply color coding
        dataRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor }
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
      
      // Add summary section
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        'Summary:',
        `Total Students: ${students.length}`,
        `Normal: ${students.filter(s => {
          const row = worksheet.getRow(students.indexOf(s) + 5);
          return parseFloat(row.getCell(5).value) >= 75;
        }).length}`,
        `Warning: ${students.filter(s => {
          const row = worksheet.getRow(students.indexOf(s) + 5);
          const pct = parseFloat(row.getCell(5).value);
          return pct >= 65 && pct < 75;
        }).length}`,
        `Critical: ${students.filter(s => {
          const row = worksheet.getRow(students.indexOf(s) + 5);
          return parseFloat(row.getCell(5).value) < 65;
        }).length}`,
        ''
      ]);
      summaryRow.font = { bold: true };
    }
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

/**
 * Generate comprehensive monthly report for all subjects in a section
 * @param {String} sectionName - Section name
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Buffer} Excel file buffer
 */
async function generateComprehensiveReport(sectionName, month, year) {
  return await generateMonthlyReport(sectionName, month, year, null);
}

/**
 * Generate report filename
 * @param {String} sectionName - Section name
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @param {String} subject - Optional subject
 * @returns {String} Filename
 */
function getReportFilename(sectionName, month, year, subject = null) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];
  
  if (subject) {
    return `${sectionName}_${subject}_Attendance_Report_${monthName}_${year}.xlsx`;
  } else {
    return `${sectionName}_Attendance_Report_${monthName}_${year}.xlsx`;
  }
}

/**
 * Auto-generate reports for all sections (for cron job)
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Array} Array of generated report info
 */
async function autoGenerateAllReports(month, year) {
  try {
    const sections = await Section.find({ isActive: true });
    const reports = [];
    
    for (const section of sections) {
      try {
        const buffer = await generateMonthlyReport(section.name, month, year);
        const filename = getReportFilename(section.name, month, year);
        
        reports.push({
          section: section.name,
          filename,
          buffer,
          success: true
        });
      } catch (error) {
        reports.push({
          section: section.name,
          error: error.message,
          success: false
        });
      }
    }
    
    return reports;
  } catch (error) {
    throw new Error(`Failed to auto-generate reports: ${error.message}`);
  }
}

module.exports = {
  generateMonthlyReport,
  generateComprehensiveReport,
  getReportFilename,
  autoGenerateAllReports
};
