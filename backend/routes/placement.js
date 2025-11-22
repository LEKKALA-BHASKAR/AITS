const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');

router.post('/company', placementController.createCompany);
router.post('/apply', placementController.applyPlacement);
router.post('/round', placementController.addRound);
router.post('/admit-card/:id', placementController.uploadAdmitCard);
router.get('/companies', placementController.getCompanies);
router.get('/applications', placementController.getApplications);
router.get('/rounds', placementController.getRounds);

module.exports = router;
