const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/has-data/:clientId/:period', reportController.hasData);
router.get('/years/:clientId', reportController.getYears);
router.post('/generate', reportController.generateReport);
router.post('/pdf', reportController.generatePDF);
router.post('/excel', reportController.generateExcel);

module.exports = router;
