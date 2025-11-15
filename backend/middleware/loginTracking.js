const LoginLog = require('../models/LoginLog');

// Track login attempts
const trackLogin = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only track login route responses
    if (req.path === '/login') {
      const isSuccess = res.statusCode === 200;
      const loginLog = new LoginLog({
        userId: isSuccess ? data.user?.id : null,
        userModel: req.body.role ? req.body.role.charAt(0).toUpperCase() + req.body.role.slice(1) : 'Unknown',
        email: req.body.email,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: isSuccess ? 'success' : 'failed',
        failureReason: !isSuccess ? data.error : null
      });
      
      loginLog.save().catch(err => console.error('Login log error:', err));
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

// Check for suspicious login attempts
const checkSuspiciousLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Count failed attempts in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedAttempts = await LoginLog.countDocuments({
      email,
      status: 'failed',
      timestamp: { $gte: fifteenMinutesAgo }
    });
    
    if (failedAttempts >= 5) {
      return res.status(429).json({ 
        error: 'Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Suspicious login check error:', error);
    next();
  }
};

module.exports = {
  trackLogin,
  checkSuspiciousLogin
};
