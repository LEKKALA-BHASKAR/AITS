const cron = require('node-cron');
const { updateStudentRiskStatus } = require('../utils/riskDetection');
const { autoGenerateAllReports } = require('../utils/monthlyReportGenerator');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const fs = require('fs').promises;
const path = require('path');

/**
 * Schedule automated tasks
 */
function initScheduledTasks() {
  // Run risk detection daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled risk detection update...');
    try {
      await updateStudentRiskStatus();
      console.log('Risk detection completed successfully');
    } catch (error) {
      console.error('Risk detection failed:', error.message);
    }
  });
  
  // Generate monthly reports on 1st of every month at 2 AM
  cron.schedule('0 2 1 * *', async () => {
    console.log('Running scheduled monthly report generation...');
    try {
      const now = new Date();
      // Generate report for previous month
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      
      const reports = await autoGenerateAllReports(lastMonth, year);
      
      // Save reports to disk (optional - can be modified to save to cloud storage)
      const reportsDir = path.join(__dirname, '../reports');
      try {
        await fs.mkdir(reportsDir, { recursive: true });
        
        for (const report of reports) {
          if (report.success && report.buffer) {
            const filepath = path.join(reportsDir, report.filename);
            await fs.writeFile(filepath, report.buffer);
            console.log(`Saved report: ${report.filename}`);
          }
        }
      } catch (fsError) {
        console.error('Error saving reports to disk:', fsError.message);
      }
      
      console.log(`Monthly report generation completed: ${reports.filter(r => r.success).length} successful`);
    } catch (error) {
      console.error('Monthly report generation failed:', error.message);
    }
  });
  
  // Lock expired attendance records every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled attendance locking...');
    try {
      const GRACE_PERIOD_MINUTES = 15;
      const now = new Date();
      const graceExpiry = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60 * 1000);
      
      // Find attendance records that should be locked
      const result = await Attendance.updateMany(
        {
          isLocked: false,
          createdAt: { $lt: graceExpiry }
        },
        {
          $set: { 
            isLocked: true,
            lockedAt: now
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Locked ${result.modifiedCount} expired attendance records`);
        
        // Log the locking action
        await AuditLog.log({
          action: 'LOCK',
          entityType: 'ATTENDANCE',
          entityId: null,
          performedBy: {
            userId: null,
            userType: 'admin',
            userName: 'System'
          },
          context: {},
          reason: 'Automatic lock after grace period expiry',
          ipAddress: 'system'
        });
      }
    } catch (error) {
      console.error('Attendance locking failed:', error.message);
    }
  });
  
  console.log('Scheduled tasks initialized');
  console.log('- Risk detection: Daily at 2:00 AM');
  console.log('- Monthly reports: 1st of each month at 2:00 AM');
  console.log('- Attendance locking: Every hour');
}

module.exports = { initScheduledTasks };
