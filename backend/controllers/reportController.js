const {
  generateMonthlyReport,
  generateComprehensiveReport,
  getReportFilename,
  autoGenerateAllReports
} = require('../utils/monthlyReportGenerator');

/**
 * Monthly Report Controller
 * Handles Excel report generation and downloads
 */

/**
 * Generate and download monthly attendance report
 * GET /api/reports/monthly/:sectionName
 */
async function downloadMonthlyReport(req, res) {
  try {
    const { sectionName } = req.params;
    const { month, year, subject } = req.query;
    
    // Validate inputs
    if (!month || !year) {
      return res.status(400).json({ 
        error: 'Month and year are required (e.g., ?month=11&year=2025)' 
      });
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }
    
    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    // Generate report
    const buffer = await generateMonthlyReport(
      sectionName,
      monthNum,
      yearNum,
      subject || null
    );
    
    // Generate filename
    const filename = getReportFilename(sectionName, monthNum, yearNum, subject);
    
    // Set headers for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send buffer
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Generate comprehensive report for all subjects
 * GET /api/reports/monthly-comprehensive/:sectionName
 */
async function downloadComprehensiveReport(req, res) {
  try {
    const { sectionName } = req.params;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ 
        error: 'Month and year are required' 
      });
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    const buffer = await generateComprehensiveReport(
      sectionName,
      monthNum,
      yearNum
    );
    
    const filename = getReportFilename(sectionName, monthNum, yearNum);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Trigger manual generation of all section reports
 * POST /api/reports/generate-all
 */
async function generateAllReports(req, res) {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        error: 'Month and year are required' 
      });
    }
    
    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can generate all reports' });
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    const reports = await autoGenerateAllReports(monthNum, yearNum);
    
    const successful = reports.filter(r => r.success).length;
    const failed = reports.filter(r => !r.success).length;
    
    res.json({
      message: `Generated ${successful} reports successfully, ${failed} failed`,
      reports: reports.map(r => ({
        section: r.section,
        filename: r.filename,
        success: r.success,
        error: r.error
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get available months for reports
 * GET /api/reports/available-months/:sectionName
 */
async function getAvailableMonths(req, res) {
  try {
    const { sectionName } = req.params;
    const Attendance = require('../models/Attendance');
    
    // Get all attendance records for this section
    const records = await Attendance.find({ section: sectionName })
      .select('date')
      .sort({ date: 1 });
    
    if (records.length === 0) {
      return res.json({ months: [] });
    }
    
    // Extract unique months
    const months = new Set();
    records.forEach(record => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });
    
    const monthList = Array.from(months).map(key => {
      const [year, month] = key.split('-');
      return {
        year: parseInt(year),
        month: parseInt(month),
        key
      };
    }).sort((a, b) => b.key.localeCompare(a.key));
    
    res.json({ months: monthList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  downloadMonthlyReport,
  downloadComprehensiveReport,
  generateAllReports,
  getAvailableMonths
};
