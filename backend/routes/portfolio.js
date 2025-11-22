const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.post('/achievement', portfolioController.addAchievement);
router.post('/certificate', portfolioController.addCertificate);
router.post('/verify/:type/:id', portfolioController.verifyItem);
router.get('/achievements/:studentId', portfolioController.getAchievements);
router.get('/certificates/:studentId', portfolioController.getCertificates);

module.exports = router;
