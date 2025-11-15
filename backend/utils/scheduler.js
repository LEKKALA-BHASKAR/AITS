const cron = require('node-cron');
const { updateStudentRiskStatus } = require('../utils/riskDetection');

/**
 * Schedule automated tasks
 */
function initScheduledTasks() {
  // Run risk detection daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled risk detection update...');
    await updateStudentRiskStatus();
  });
  
  console.log('Scheduled tasks initialized');
  console.log('- Risk detection: Daily at 2:00 AM');
}

module.exports = { initScheduledTasks };
